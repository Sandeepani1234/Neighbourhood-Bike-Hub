(() => {
  const $ = id => document.getElementById(id);
  const KEYS = { bikes:"nbh2_bikes", bookings:"nbh2_bookings", reports:"nbh2_reports", users:"nbh2_users", session:"nbh2_session", settings:"nbh2_settings", equipment:"nbh2_equipment" };
  const starterBikes = [
    {id:"NB-01",type:"Normal bicycle",status:"Available",battery:"Not applicable",image:"https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=900&q=80",description:"A reliable everyday bicycle for commuting, local errands and short trips.",tip:"Good for everyday trips and grocery shopping."},
    {id:"NB-02",type:"Normal bicycle",status:"Available",battery:"Not applicable",image:"https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=900&q=80",description:"An easy-to-use shared bicycle for exploring your neighbourhood.",tip:"Check the brakes and tyres before you set off."},
    {id:"NB-03",type:"Normal bicycle",status:"Available",battery:"Not applicable",image:"https://images.unsplash.com/photo-1511994298241-608e28f14운데?auto=format&fit=crop&w=900&q=80".replace("f14운데","f14d03"),description:"A practical bicycle for short journeys and daily commuting.",tip:"Return the bike to the designated hub parking area."},
    {id:"EB-01",type:"Electric bicycle",status:"Available",battery:"75%",image:"https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=900&q=80",description:"Electric assistance for longer rides, hills and journeys where you need a little extra help.",tip:"Check battery level and follow e-bike instructions."},
    {id:"CB-01",type:"Cargo bicycle",status:"Available",battery:"Not applicable",image:"https://images.unsplash.com/photo-1593764592116-bfb2a97c642a?auto=format&fit=crop&w=900&q=80",description:"Carry groceries, bags and other belongings without taking the car for a short trip.",tip:"Secure your load and take turns slowly."}
  ];
  const starterUsers = [
    {id:"U-001",name:"Demo Resident",email:"resident@example.com",password:"BikeHub123",residentId:"A-204",role:"resident",approved:true},
    {id:"U-002",name:"Demo Administrator",email:"admin@bikehub.demo",password:"AdminHub123",residentId:"HOUSING-ADMIN",role:"admin",approved:true}
  ];
  const defaults = {limit:2};
  let bikes = load(KEYS.bikes, starterBikes);
  let bookings = load(KEYS.bookings, []);
  let reports = load(KEYS.reports, []);
  let users = load(KEYS.users, starterUsers);
  let settings = load(KEYS.settings, defaults);
  let equipment = load(KEYS.equipment, {pump:"Available",stand:"Available",tools:"Available",patch:"Available"});
  let currentUser = load(KEYS.session, null);
  let authTab = "login", toastTimer;

  function load(key, fallback) { try { const v=JSON.parse(localStorage.getItem(key)); return v===null?structuredClone(fallback):v; } catch { return structuredClone(fallback); } }
  function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  function esc(v) { return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function makeId(prefix) { return `${prefix}-${Math.random().toString(36).slice(2,5).toUpperCase()}${Date.now().toString().slice(-4)}`; }
  function today() { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
  function dateObj(s) { return new Date(`${s}T12:00:00`); }
  function dateLabel(s) { return dateObj(s).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}); }
  function timeLabel(s) { if(!s)return ""; const [h,m]=s.split(":").map(Number); return new Date(2000,0,1,h,m).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}); }
  function toast(msg) { const el=$("toast");el.textContent=msg;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),3200); }
  function isActive(b) { return b.status!=="Cancelled"; }
  function isUpcoming(b) { return isActive(b)&&(b.date>today()||(b.date===today()&&b.end>new Date().toTimeString().slice(0,5))); }
  function overlaps(a,b) { return a.start < b.end && b.start < a.end; }
  function statusBookable(bike) { return bike.status==="Available"; }
  function bookingConflicts(bikeId,date,start,end,excludeId=null) {
    return bookings.some(b=>b.bikeId===bikeId&&b.id!==excludeId&&isActive(b)&&b.date===date&&overlaps({start,end},b));
  }
  function busyForSlot(bike,date,start,end) { return !statusBookable(bike)||bookingConflicts(bike.id,date,start,end); }
  function currentBikes() { return bikes.filter(b=>statusBookable(b)); }
  function setHashPage() {
    let page=(location.hash||"#home").slice(1); if(!$(`${page}`))page="home";
    document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id===page));
    document.querySelectorAll("[data-nav]").forEach(a=>a.classList.toggle("active",a.dataset.nav===page));
    $("nav").classList.remove("open");
    window.scrollTo({top:0,behavior:"smooth"});
    if(page==="borrow") { renderBikes();renderResidentBookings(); }
    if(page==="admin") renderAdmin();
    if(page==="repair") renderRepairEquipment();
    if(page==="home") renderHomeInventory();
    if(page==="qr") $("qrUrl").textContent=location.href.split("#")[0]+"#qr";
  }
  window.addEventListener("hashchange",setHashPage);
  $("mobileMenu").addEventListener("click",()=>$("nav").classList.toggle("open"));

  // Account demo. Browser-only authentication is not production security.
  function openLogin(tab="login") { setAuthTab(tab);$("loginModal").classList.remove("hidden");$("loginError").classList.add("hidden"); }
  function closeLogin() { $("loginModal").classList.add("hidden"); }
  $("loginOpen").addEventListener("click",()=>openLogin());
  $("loginClose").addEventListener("click",closeLogin);
  $("loginModal").addEventListener("click",e=>{if(e.target===$("loginModal"))closeLogin();});
  document.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>setAuthTab(b.dataset.tab)));
  function setAuthTab(tab) {
    authTab=tab;document.querySelectorAll("[data-tab]").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));
    $("registerFields").classList.toggle("hidden",tab!=="register");$("loginSubmit").textContent=tab==="register"?"Create demo account":"Sign in";
    $("loginTitle").textContent=tab==="register"?"Join your neighbourhood.":"Welcome back.";
  }
  $("loginForm").addEventListener("submit",e=>{
    e.preventDefault();const email=$("loginEmail").value.trim().toLowerCase(),password=$("loginPassword").value;
    if(authTab==="register") {
      const name=$("registerName").value.trim(),residentId=$("registerId").value.trim();
      if(!name||!residentId){showLoginError("Please enter your name and resident ID.");return;}
      if(!email||!password){showLoginError("Please enter an email and password.");return;}
      if(users.some(u=>u.email.toLowerCase()===email)){showLoginError("An account with this email already exists.");return;}
      const user={id:makeId("U"),name,email,password,residentId,role:"resident",approved:$("registerApproved").checked};
      users.push(user);save(KEYS.users,users);
      if(!user.approved){showLoginError("Registration submitted. A housing administrator must approve the account before booking. In this demo, ask the admin to approve it.");renderAdmin();return;}
      loginUser(user);toast("Demo resident account created.");
    } else {
      const user=users.find(u=>u.email.toLowerCase()===email&&u.password===password);
      if(!user){showLoginError("Email or password is incorrect.");return;}
      if(user.role==="resident"&&!user.approved){showLoginError("This resident account is waiting for administrator approval.");return;}
      loginUser(user);
    }
  });
  function showLoginError(msg){$("loginError").textContent=msg;$("loginError").classList.remove("hidden");}
  function loginUser(user){currentUser={id:user.id,name:user.name,email:user.email,role:user.role,residentId:user.residentId};save(KEYS.session,currentUser);closeLogin();renderAccount();renderResidentBookings();if(location.hash==="#admin")renderAdmin();toast(`Signed in as ${user.role==="admin"?"administrator":"resident"}.`);}
  function logout(){currentUser=null;save(KEYS.session,null);renderAccount();renderResidentBookings();if(location.hash==="#admin")renderAdmin();toast("You have signed out.");}
  function renderAccount(){
    const area=$("accountArea");
    if(currentUser)area.innerHTML=`<div class="signed-user"><span class="user-avatar">${esc(currentUser.name.slice(0,1).toUpperCase())}</span><span class="signed-name">${esc(currentUser.name.split(" ")[0])}<small>${currentUser.role==="admin"?"Administrator":"Resident"}</small></span><button class="btn btn-outline btn-small" id="accountAction">${currentUser.role==="admin"?"Admin":"Sign out"}</button></div>`;
    else area.innerHTML='<button class="btn btn-outline btn-small" id="loginOpen">Resident login</button>';
    const action=$("accountAction");if(action)action.addEventListener("click",()=>currentUser.role==="admin"?(location.hash="#admin"):logout());
    const open=$("loginOpen");if(open)open.addEventListener("click",()=>openLogin());
  }

  // Time options use 30-minute intervals from 07:00 to 21:00.
  const times=[];for(let h=7;h<=21;h++){times.push(`${String(h).padStart(2,"0")}:00`);if(h<21)times.push(`${String(h).padStart(2,"0")}:30`);}
  function fillTimeSelect(id,selected){$(id).innerHTML=times.map(t=>`<option value="${t}">${timeLabel(t)}</option>`).join("");if(selected)$(id).value=selected;}
  fillTimeSelect("filterStart","09:00");fillTimeSelect("filterEnd","11:00");
  fillTimeSelect("bookingStart","09:00");fillTimeSelect("bookingEnd","11:00");
  $("filterDate").min=today();$("filterDate").value=today();$("bookingDate").min=today();$("bookingDate").value=today();

  function getFilter(){return {date:$("filterDate").value||today(),start:$("filterStart").value,end:$("filterEnd").value};}
  ["filterDate","filterStart","filterEnd"].forEach(id=>$(id).addEventListener("change",renderBikes));
  function renderBikes(){
    const filter=getFilter();const invalid=filter.end<=filter.start;
    const available=bikes.filter(b=>!invalid&&!busyForSlot(b,filter.date,filter.start,filter.end));
    $("fleetSummary").textContent=invalid?"End time must be after start time":`${available.length} of ${bikes.length} bikes available for this slot`;
    $("noBikes").classList.toggle("hidden",available.length>0||invalid);
    $("bikeGrid").innerHTML=bikes.map(b=>{
      const free=!invalid&&!busyForSlot(b,filter.date,filter.start,filter.end);
      const icon=b.type==="Normal bicycle"?"🚲":b.type==="Electric bicycle"?"⚡":"▰";
      return `<article class="bike-card ${free?"":"unavailable"}"><div class="bike-image"><img src="${esc(b.image||starterBikes[0].image)}" alt="${esc(b.type)}" loading="lazy"><span class="bike-type-tag">${icon} ${esc(b.type)}</span><span class="bike-id">${esc(b.id)}</span></div><div class="bike-body"><div class="bike-title-row"><div><h3>${esc(b.type)}</h3><p>Free shared bicycle</p></div><span class="availability-badge ${free?"":"unavailable"}">${free?"Available":"Unavailable"}</span></div>${b.type==="Electric bicycle"?`<div class="battery">Battery status: <b>${esc(b.battery||"Check with hub")}</b></div>`:""}<p class="bike-desc">${esc(b.description||"Shared bicycle for local journeys.")}</p><div class="usage-tip">${esc(b.tip||"Check the bicycle before riding.")}</div><button class="btn" data-book-bike="${esc(b.id)}" ${free?"":"disabled"}>Book for Free <span>→</span></button></div></article>`;
    }).join("");
  }
  $("bikeGrid").addEventListener("click",e=>{const btn=e.target.closest("[data-book-bike]");if(!btn)return;const bike=bikes.find(b=>b.id===btn.dataset.bookBike);if(!bike)return;if(!currentUser){openLogin();toast("Please sign in with an approved resident account first.");return;}if(currentUser.role!=="resident"){toast("Use a resident account to test resident bookings.");return;}if(!users.find(u=>u.id===currentUser.id)?.approved){toast("Your resident account needs approval.");return;}openBooking(bike);});
  function openBooking(bike){$("selectedBikeId").value=bike.id;$("selectedBikeLabel").textContent=`${bike.type} · ${bike.id} · Free to borrow`;$("bookingDate").min=today();$("bookingDate").value=getFilter().date||today();fillTimeSelect("bookingStart",getFilter().start);fillTimeSelect("bookingEnd",getFilter().end);$("bookingError").classList.add("hidden");$("bookingCheck").textContent=`Booking duration limit: ${settings.limit} hour${settings.limit===1?"":"s"}.`; $("bookingModal").classList.remove("hidden");checkBookingSlot();}
  function closeBooking(){$("bookingModal").classList.add("hidden");}
  $("bookingClose").addEventListener("click",closeBooking);$("bookingModal").addEventListener("click",e=>{if(e.target===$("bookingModal"))closeBooking();});
  ["bookingDate","bookingStart","bookingEnd"].forEach(id=>$(id).addEventListener("change",checkBookingSlot));
  function checkBookingSlot(){
    const bike=bikes.find(b=>b.id===$("selectedBikeId").value),date=$("bookingDate").value,start=$("bookingStart").value,end=$("bookingEnd").value,msg=$("bookingCheck");
    if(!bike||!date){msg.textContent="Choose a date and time.";msg.className="inline-msg";return false;}
    if(date<today()){msg.textContent="Choose today or a future date.";msg.className="inline-msg error";return false;}
    if(end<=start){msg.textContent="End time must be after start time.";msg.className="inline-msg error";return false;}
    const duration=(Number(end.slice(0,2))*60+Number(end.slice(3))-Number(start.slice(0,2))*60-Number(start.slice(3)))/60;
    if(duration>Number(settings.limit)){msg.textContent=`This booking is ${duration} hours. The current limit is ${settings.limit} hour(s).`;msg.className="inline-msg error";return false;}
    if(date===today()&&new Date(`${date}T${start}:00`)<=new Date()){msg.textContent="Choose a start time that has not passed.";msg.className="inline-msg error";return false;}
    if(!statusBookable(bike)){msg.textContent="This bicycle is not currently available for booking.";msg.className="inline-msg error";return false;}
    if(bookingConflicts(bike.id,date,start,end)){msg.textContent="This bicycle is already booked for part of this time. Please choose another slot.";msg.className="inline-msg error";return false;}
    msg.textContent="This time is available. Booking cost: 0 kr.";msg.className="inline-msg success";return true;
  }
  $("bookingForm").addEventListener("submit",e=>{
    e.preventDefault();if(!currentUser||currentUser.role!=="resident"){closeBooking();openLogin();return;}
    if(!checkBookingSlot())return;
    const bike=bikes.find(b=>b.id===$("selectedBikeId").value),date=$("bookingDate").value,start=$("bookingStart").value,end=$("bookingEnd").value;
    // Re-check immediately before save to prevent overlapping demo bookings.
    if(bookingConflicts(bike.id,date,start,end)){checkBookingSlot();return;}
    const booking={id:makeId("BK"),bikeId:bike.id,bikeType:bike.type,date,start,end,residentUserId:currentUser.id,residentName:currentUser.name,residentId:currentUser.residentId,status:"Confirmed",createdAt:new Date().toISOString(),price:0};
    bookings.push(booking);save(KEYS.bookings,bookings);closeBooking();renderBikes();renderResidentBookings();renderHomeInventory();renderAdmin();
    toast(`Booking confirmed: ${bike.id}. Cost: 0 kr.`);
    alert(`Booking confirmed — ${booking.id}\n\nBicycle: ${bike.type} (${bike.id})\nDate: ${dateLabel(date)}\nTime: ${timeLabel(start)}–${timeLabel(end)}\nPrice: 0 kr (free)\n\nCollection: Visit the Bike Hub at your booked start time. Follow the housing provider's instructions for the key or lock. Return the bicycle to the same hub by ${timeLabel(end)}. Please report any problems.`);
  });
  function renderResidentBookings(){
    const container=$("residentBookings");
    if(!currentUser||currentUser.role!=="resident"){$("residentBookingCount").textContent="Sign in as a resident to view your bookings";container.innerHTML='<div class="empty" style="grid-column:1/-1">Your personal bookings will appear here after you sign in.</div>';return;}
    const own=bookings.filter(b=>b.residentUserId===currentUser.id&&isUpcoming(b)).sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start));
    $("residentBookingCount").textContent=`${own.length} upcoming booking${own.length===1?"":"s"}`;
    if(!own.length){container.innerHTML='<div class="empty" style="grid-column:1/-1">You have no upcoming bookings. Choose a free bike above to get started.</div>';return;}
    container.innerHTML=own.map(b=>`<article class="booking-item"><div class="date-tile"><strong>${dateObj(b.date).getDate()}</strong><small>${dateObj(b.date).toLocaleDateString("en-GB",{month:"short"})}</small></div><div class="booking-info"><b>${esc(b.bikeType)} · ${esc(b.bikeId)}</b><p>${dateLabel(b.date)} · ${timeLabel(b.start)}–${timeLabel(b.end)}</p><p>Ref: ${esc(b.id)} · Free</p></div><button class="cancel-booking" data-cancel-own="${esc(b.id)}">Cancel</button></article>`).join("");
  }
  $("residentBookings").addEventListener("click",e=>{const btn=e.target.closest("[data-cancel-own]");if(!btn)return;const b=bookings.find(x=>x.id===btn.dataset.cancelOwn);if(!b||b.residentUserId!==currentUser?.id)return;if(!confirm(`Cancel booking ${b.id}?`))return;b.status="Cancelled";save(KEYS.bookings,bookings);renderResidentBookings();renderBikes();renderAdmin();toast("Booking cancelled.");});

  // Reports are browser-local demo data and not transmitted to a housing provider.
  $("reportBike").innerHTML='<option value="">Not applicable / not sure</option>'+bikes.map(b=>`<option value="${esc(b.id)}">${esc(b.id)} — ${esc(b.type)}</option>`).join("");
  $("reportForm").addEventListener("submit",e=>{
    e.preventDefault();if(!$("reportForm").reportValidity())return;
    const report={id:makeId("RP"),category:$("reportCategory").value,bikeId:$("reportBike").value,description:$("reportDescription").value.trim(),contact:$("reportContact").value.trim(),photoName:$("reportPhoto").files[0]?.name||"",status:"Open",date:today(),createdAt:new Date().toISOString(),submittedBy:currentUser?.id||null};
    reports.unshift(report);save(KEYS.reports,reports);$("reportForm").reset();$("reportResult").classList.remove("hidden");$("reportResult").innerHTML=`<b>Demo report recorded.</b>Reference number: ${esc(report.id)}. This report is stored in this browser only and has not been sent to a housing provider.`;toast(`Report ${report.id} saved in this browser.`);renderAdmin();
  });

  // Home and repair station status
  function renderHomeInventory(){
    const filter=getFilterSafe();const available=bikes.filter(b=>!busyForSlot(b,filter.date,filter.start,filter.end));
    $("homeInventory").innerHTML=[["Normal bikes",bikes.filter(b=>b.type==="Normal bicycle"&&!busyForSlot(b,filter.date,filter.start,filter.end)).length],["E-bike",bikes.filter(b=>b.type==="Electric bicycle"&&!busyForSlot(b,filter.date,filter.start,filter.end)).length],["Cargo bike",bikes.filter(b=>b.type==="Cargo bicycle"&&!busyForSlot(b,filter.date,filter.start,filter.end)).length]].map(([name,n])=>`<div class="inv-mini"><strong>${n}</strong><span>${name} available</span></div>`).join("");
  }
  function getFilterSafe(){return {date:$("filterDate")?.value||today(),start:$("filterStart")?.value||"09:00",end:$("filterEnd")?.value||"11:00"};}
  function renderRepairEquipment(){
    const ids={pump:"pumpPublicStatus",stand:"standPublicStatus",tools:"toolsPublicStatus",patch:"patchPublicStatus"};
    Object.entries(ids).forEach(([key,id])=>{const el=$(id);if(el)el.textContent=equipment[key]||"Available";});
  }

  // Administrator-only UI gate. Demo auth is client-side and must not be used as real security.
  $("adminLoginBtn").addEventListener("click",()=>openLogin());
  function renderAdmin(){
    const authorised=currentUser?.role==="admin";
    $("adminGate").classList.toggle("hidden",authorised);$("adminDashboard").classList.toggle("hidden",!authorised);
    if(!authorised)return;
    bikes=load(KEYS.bikes,starterBikes);bookings=load(KEYS.bookings,[]);reports=load(KEYS.reports,[]);users=load(KEYS.users,starterUsers);settings=load(KEYS.settings,defaults);equipment=load(KEYS.equipment,{pump:"Available",stand:"Available",tools:"Available",patch:"Available"});
    $("statTotal").textContent=bikes.length;$("statAvailable").textContent=bikes.filter(statusBookable).length;$("statBookings").textContent=bookings.filter(isUpcoming).length;$("statReports").textContent=reports.filter(r=>r.status!=="Resolved").length;
    $("durationLimit").value=String(settings.limit);
    for(const key of ["pump","stand","tools","patch"])$(key+"Status").value=equipment[key]||"Available";
    renderFleetAdmin();renderAdminBookings();renderAdminReports();renderAdminResidents();renderUsage();
  }
  function renderFleetAdmin(){
    $("adminFleet").innerHTML=bikes.map(b=>`<div class="fleet-row"><span class="fleet-type-icon">${b.type==="Normal bicycle"?"🚲":b.type==="Electric bicycle"?"⚡":"▰"}</span><div class="fleet-main"><b>${esc(b.id)} · ${esc(b.type)}</b><small>${b.type==="Electric bicycle"?"Battery: "+esc(b.battery||"Unknown"):"Shared bike · Free to borrow"}</small></div><select data-bike-status="${esc(b.id)}" aria-label="Status for ${esc(b.id)}"><option ${b.status==="Available"?"selected":""}>Available</option><option ${b.status==="Needs Maintenance"?"selected":""}>Needs Maintenance</option><option ${b.status==="Out of Service"?"selected":""}>Out of Service</option></select>${b.type==="Electric bicycle"?`<select data-bike-battery="${esc(b.id)}" aria-label="Battery for ${esc(b.id)}"><option ${b.battery==="100%"?"selected":""}>100%</option><option ${b.battery==="75%"?"selected":""}>75%</option><option ${b.battery==="50%"?"selected":""}>50%</option><option ${b.battery==="25%"?"selected":""}>25%</option><option ${b.battery==="Needs charging"?"selected":""}>Needs charging</option></select>`:""}<button class="icon-button" data-edit-bike="${esc(b.id)}">Edit</button><button class="icon-button" data-remove-bike="${esc(b.id)}">Remove</button></div>`).join("");
  }
  $("adminFleet").addEventListener("change",e=>{
    const status=e.target.closest("[data-bike-status]");const battery=e.target.closest("[data-bike-battery]");
    if(status){const b=bikes.find(x=>x.id===status.dataset.bikeStatus);if(b){b.status=status.value;save(KEYS.bikes,bikes);renderAdmin();renderBikes();renderHomeInventory();toast("Bicycle status updated.");}}
    if(battery){const b=bikes.find(x=>x.id===battery.dataset.bikeBattery);if(b){b.battery=battery.value;save(KEYS.bikes,bikes);renderAdmin();toast("Battery status updated.");}}
  });
  $("adminFleet").addEventListener("click",e=>{
    const edit=e.target.closest("[data-edit-bike]");const remove=e.target.closest("[data-remove-bike]");
    if(edit){const b=bikes.find(x=>x.id===edit.dataset.editBike);if(b)openBikeEditor(b);}
    if(remove){const b=bikes.find(x=>x.id===remove.dataset.removeBike);if(!b)return;if(bookings.some(x=>x.bikeId===b.id&&isUpcoming(x))){toast("This bike has upcoming bookings. Cancel them before removing it.");return;}if(!confirm(`Remove bicycle ${b.id} from the demo fleet?`))return;bikes=bikes.filter(x=>x.id!==b.id);save(KEYS.bikes,bikes);refreshBikeDropdown();renderAdmin();renderBikes();renderHomeInventory();toast("Bicycle removed from demo fleet.");}
  });
  $("addBike").addEventListener("click",()=>openBikeEditor(null));
  function openBikeEditor(b){
    $("bikeEditor").classList.remove("hidden");$("editorTitle").textContent=b?"Edit bicycle":"Add bicycle";$("editOriginalId").value=b?.id||"";$("bikeId").value=b?.id||"";$("bikeId").readOnly=!!b;$("bikeType").value=b?.type||"Normal bicycle";$("bikeStatus").value=b?.status||"Available";$("bikeBattery").value=b?.battery||"Not applicable";$("batteryField").classList.toggle("hidden",$("bikeType").value!=="Electric bicycle");$("bikeType").disabled=!!b;
    $("bikeEditor").scrollIntoView({behavior:"smooth",block:"nearest"});
  }
  $("bikeType").addEventListener("change",()=>$("batteryField").classList.toggle("hidden",$("bikeType").value!=="Electric bicycle"));
  $("cancelBikeEdit").addEventListener("click",()=>$("bikeEditor").classList.add("hidden"));
  $("bikeForm").addEventListener("submit",e=>{
    e.preventDefault();const oldId=$("editOriginalId").value,id=$("bikeId").value.trim().toUpperCase(),type=$("bikeType").value,status=$("bikeStatus").value,battery=type==="Electric bicycle"?$("bikeBattery").value:"Not applicable";
    if(!id){toast("Enter a bicycle ID.");return;}
    if(!oldId&&bikes.some(b=>b.id===id)){toast("That bicycle ID already exists.");return;}
    if(oldId){const b=bikes.find(x=>x.id===oldId);Object.assign(b,{id,type,status,battery});}
    else {const sample=starterBikes.find(x=>x.type===type)||starterBikes[0];bikes.push({id,type,status,battery,image:sample.image,description:sample.description,tip:sample.tip});}
    save(KEYS.bikes,bikes);$("bikeEditor").classList.add("hidden");refreshBikeDropdown();renderAdmin();renderBikes();renderHomeInventory();toast("Fleet saved in this browser.");
  });
  function refreshBikeDropdown(){const select=$("reportBike"),old=select.value;select.innerHTML='<option value="">Not applicable / not sure</option>'+bikes.map(b=>`<option value="${esc(b.id)}">${esc(b.id)} — ${esc(b.type)}</option>`).join("");if([...select.options].some(o=>o.value===old))select.value=old;}
  $("saveDuration").addEventListener("click",()=>{settings.limit=Number($("durationLimit").value);save(KEYS.settings,settings);toast(`Maximum booking duration is now ${settings.limit} hour(s).`);renderBikes();});
  $("saveRepairStatus").addEventListener("click",()=>{equipment={pump:$("pumpStatus").value,stand:$("standStatus").value,tools:$("toolsStatus").value,patch:$("patchStatus").value};save(KEYS.equipment,equipment);renderRepairEquipment();toast("Repair equipment status saved.");});
  function renderAdminBookings(){
    const list=bookings.filter(isUpcoming).sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start));
    $("adminBookingEmpty").classList.toggle("hidden",list.length>0);
    $("adminBookings").innerHTML=list.map(b=>`<tr><td>${esc(b.residentName)}</td><td>${esc(b.bikeId)}</td><td>${dateLabel(b.date)}</td><td>${timeLabel(b.start)}–${timeLabel(b.end)}</td><td>${esc(b.residentId)}</td><td><span class="table-status">${esc(b.status)}</span></td><td><button class="table-action" data-admin-cancel="${esc(b.id)}">Cancel</button></td></tr>`).join("");
  }
  $("adminBookings").addEventListener("click",e=>{const btn=e.target.closest("[data-admin-cancel]");if(!btn)return;const b=bookings.find(x=>x.id===btn.dataset.adminCancel);if(!b)return;if(!confirm(`Cancel booking ${b.id}?`))return;b.status="Cancelled";save(KEYS.bookings,bookings);renderAdmin();renderBikes();renderResidentBookings();renderHomeInventory();toast("Booking cancelled.");});
  function renderAdminReports(){
    $("adminReportCount").textContent=`${reports.length} report${reports.length===1?"":"s"}`;$("adminReportEmpty").classList.toggle("hidden",reports.length>0);
    $("adminReports").innerHTML=reports.map(r=>`<article class="admin-report"><span>＋</span><div class="report-main"><b>${esc(r.category)}${r.bikeId?" · "+esc(r.bikeId):""}</b><p>${esc(r.description)}</p><small>${esc(r.id)} · ${dateLabel(r.date)}${r.contact?" · "+esc(r.contact):""}</small></div><select data-report-status="${esc(r.id)}" aria-label="Report status"><option ${r.status==="Open"?"selected":""}>Open</option><option ${r.status==="In Progress"?"selected":""}>In Progress</option><option ${r.status==="Resolved"?"selected":""}>Resolved</option></select></article>`).join("");
  }
  $("adminReports").addEventListener("change",e=>{const select=e.target.closest("[data-report-status]");if(!select)return;const r=reports.find(x=>x.id===select.dataset.reportStatus);if(r){r.status=select.value;save(KEYS.reports,reports);renderAdmin();toast("Maintenance report updated.");}});
  function renderAdminResidents(){
    $("adminResidents").innerHTML=users.map(u=>`<div class="resident-row"><span class="resident-avatar">${esc(u.name.slice(0,1).toUpperCase())}</span><div><b>${esc(u.name)}</b><small>${esc(u.email)} · ${esc(u.residentId||"No resident ID")}</small></div>${u.role==="admin"?'<span class="table-status">Admin</span>':`<select data-resident-approval="${esc(u.id)}" aria-label="Resident approval"><option value="true" ${u.approved?"selected":""}>Approved</option><option value="false" ${!u.approved?"selected":""}>Pending</option></select>`}</div>`).join("");
  }
  $("adminResidents").addEventListener("change",e=>{const select=e.target.closest("[data-resident-approval]");if(!select)return;const u=users.find(x=>x.id===select.dataset.residentApproval);if(u){u.approved=select.value==="true";save(KEYS.users,users);if(currentUser?.id===u.id&&!u.approved)logout();renderAdmin();toast("Resident access updated.");}});
  function renderUsage(){
    const categories=["Normal bicycle","Electric bicycle","Cargo bicycle"];const counts=categories.map(t=>bookings.filter(b=>b.bikeType===t&&isActive(b)).length);const max=Math.max(1,...counts);
    $("usageBars").innerHTML=categories.map((c,i)=>`<div class="usage-row"><span>${esc(c)}</span><div class="bar-track"><div class="bar-fill" style="width:${counts[i]/max*100}%"></div></div><b>${counts[i]}</b></div>`).join("");
  }
  $("exportCsv").addEventListener("click",()=>{
    if(!bookings.length){toast("No bookings to export yet.");return;}
    const rows=[["Booking reference","Resident","Resident ID","Bicycle ID","Bicycle type","Date","Start","End","Status","Price"],...bookings.map(b=>[b.id,b.residentName,b.residentId,b.bikeId,b.bikeType,b.date,b.start,b.end,b.status,"0"])];
    const csv=rows.map(r=>r.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(",")).join("\r\n");
    const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"}));const a=document.createElement("a");a.href=url;a.download="neighbourhood-bike-hub-bookings.csv";a.click();URL.revokeObjectURL(url);toast("CSV exported.");
  });

  renderAccount();renderHomeInventory();renderBikes();renderResidentBookings();renderRepairEquipment();setHashPage();
})();