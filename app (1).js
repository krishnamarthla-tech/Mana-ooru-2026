import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, query, orderBy, updateDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDN2PSLt_x5BdM9l0nyhX0UCVEM3vQ4llw",
  authDomain: "mana-ooru-4faea.firebaseapp.com",
  projectId: "mana-ooru-4faea",
  appId: "1:667942607938:web:b4fd2831e0c801e88d21db"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const $ = (id) => document.getElementById(id);
let cart = [];
let productCache = [];

function say(message) { $("message").textContent = message; }
function money(n) { return "₹" + Number(n || 0).toFixed(2); }
function renderCart() {
  $("cart").textContent = cart.length ? cart.map(x => `${x.productName} × ${x.qty} = ${money(x.price*x.qty)}`).join("\n") : "ఇంకా వస్తువులు ఎంచుకోలేదు.";
  $("total").value = cart.reduce((s,x)=>s+x.price*x.qty,0);
}
async function loadProducts() {
  try {
    const snap = await getDocs(collection(db,"products"));
    productCache = snap.docs.map(d => ({id:d.id,...d.data()}));
    $("products").innerHTML = "";
    if (!productCache.length) {
      $("products").innerHTML = '<p class="muted">ఇంకా ఉత్పత్తులు లేవు. అడ్మిన్ లాగిన్ చేసి ఉత్పత్తి చేర్చవచ్చు.</p>';
      return;
    }
    productCache.forEach(p => {
      const el = document.createElement("div"); el.className="product";
      const info = document.createElement("div");
      const name = document.createElement("strong"); name.textContent = p.productName || p.name || "ఉత్పత్తి";
      const sub = document.createElement("div"); sub.className="muted"; sub.textContent = `${p.category || ""}  ${money(p.price)}`;
      info.append(name,sub);
      const btn = document.createElement("button"); btn.textContent="జోడించు";
      btn.onclick=()=>{const found=cart.find(x=>x.id===p.id); if(found)found.qty++; else cart.push({id:p.id,productName:p.productName||p.name,price:Number(p.price)||0,qty:1});renderCart();};
      el.append(info,btn); $("products").append(el);
    });
  } catch(e) { $("products").textContent="ఉత్పత్తులు లోడ్ కాలేదు. Firestore Rules సెటప్ అవసరం."; say("Firebase కనెక్షన్ ఉంది; కానీ Firestore చదవడానికి అనుమతి లేదు. Rules సెటప్ చేయాలి."); }
}
$("placeOrder").onclick = async () => {
  const name=$("customerName").value.trim(), phone=$("phone").value.trim(), address=$("address").value.trim();
  if(!name || !phone || !address || !cart.length){say("దయచేసి పేరు, ఫోన్, చిరునామా మరియు కనీసం ఒక వస్తువు నమోదు చేయండి.");return;}
  if(!/^[0-9+\-\s]{10,15}$/.test(phone)){say("దయచేసి సరైన ఫోన్ నంబర్ నమోదు చేయండి.");return;}
  try {
    await addDoc(collection(db,"orders"), {
      village:$("village").value, customerName:name, phone, address,
      items:cart, total:Number($("total").value), paymentMethod:$("payment").value,
      status:"New", createdAt:serverTimestamp()
    });
    cart=[];renderCart();say("మీ ఆర్డర్ పంపబడింది. ధన్యవాదాలు!");
  } catch(e) { say("ఆర్డర్ పంపలేకపోయాం. Firestore Rules ఇంకా సెటప్ చేయాలి. Error: "+e.code); }
};
$("adminLogin").onclick = async () => {
  try { await signInWithEmailAndPassword(auth,$("adminEmail").value.trim(),$("adminPassword").value); say("అడ్మిన్ లాగిన్ అయ్యారు."); }
  catch(e){say("లాగిన్ కాలేదు. Firebase Authentication‌లో Email/Password ప్రారంభించి అడ్మిన్ ఖాతా సృష్టించాలి. ("+e.code+")");}
};
$("adminLogout").onclick=()=>signOut(auth);
onAuthStateChanged(auth, async user => {
  const isAdmin=!!user && !!user.email;
  $("adminPanel").classList.toggle("hidden",!isAdmin);
  $("adminLogout").classList.toggle("hidden",!isAdmin);
  $("adminLogin").classList.toggle("hidden",isAdmin);
  if(isAdmin) await loadOrders();
});
async function loadOrders(){
  try{
    const snap=await getDocs(query(collection(db,"orders"),orderBy("createdAt","desc")));
    $("orders").innerHTML="";
    if(snap.empty){$("orders").textContent="ఇంకా ఆర్డర్లు లేవు.";return;}
    snap.forEach(d=>{
      const o=d.data(), el=document.createElement("div");el.className="order";
      const details=document.createElement("div");
      details.textContent=`${o.village||""} | ${o.customerName||""} | ${o.phone||""}\n${o.address||""}\n${(o.items||[]).map(i=>`${i.productName} × ${i.qty}`).join(", ")}\nమొత్తం: ${money(o.total)} | చెల్లింపు: ${o.paymentMethod||""} | స్థితి: ${o.status||""}`;
      const sel=document.createElement("select");
      ["New","Accepted","Preparing","Out for delivery","Delivered","Cancelled"].forEach(s=>{const op=document.createElement("option");op.value=s;op.textContent=s;op.selected=s===(o.status||"New");sel.append(op);});
      const save=document.createElement("button");save.textContent="స్థితి మార్చండి";
      save.onclick=async()=>{try{await updateDoc(doc(db,"orders",d.id),{status:sel.value});say("ఆర్డర్ స్థితి మార్చబడింది.");}catch(e){say("మార్చలేకపోయాం: "+e.code);}};
      el.append(details,sel,save);$("orders").append(el);
    });
  }catch(e){$("orders").textContent="ఆర్డర్లు చూడటానికి అనుమతి లేదు. Firestore Rules సరిచూడాలి.";}
}
$("addProduct").onclick=async()=>{
  const productName=$("newProductName").value.trim(),price=Number($("newProductPrice").value),category=$("newProductCategory").value.trim();
  if(!productName||!price||!category){say("ఉత్పత్తి పేరు, ధర, వర్గం నమోదు చేయండి.");return;}
  try{await addDoc(collection(db,"products"),{productName,price,category,source:"మన స్టోర్",createdAt:serverTimestamp()});$("newProductName").value="";$("newProductPrice").value="";$("newProductCategory").value="";await loadProducts();say("ఉత్పత్తి చేర్చబడింది.");}
  catch(e){say("ఉత్పత్తి చేర్చలేకపోయాం: "+e.code);}
};
loadProducts();
