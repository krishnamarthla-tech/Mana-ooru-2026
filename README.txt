మన ఊరు – Firebase ప్రారంభ వెర్షన్

ఈ ZIP లో:
- index.html: యాప్ తెర
- app.js: Firebase కనెక్షన్, ఉత్పత్తులు, ఆర్డర్లు, అడ్మిన్
- firestore.rules: Firestore భద్రతా నియమాలు
- manifest.json: PWA వివరాలు

ముఖ్యమైన సెటప్ (లైవ్‌లో ఉపయోగించే ముందు తప్పనిసరి):
1. Firebase Console > Authentication > Get started > Sign-in method > Email/Password ను Enable చేయండి.
2. Authentication > Users లో అడ్మిన్ ఇమెయిల్‌తో ఖాతా సృష్టించండి. పాస్‌వర్డ్‌ను మీరే సెట్ చేయండి; ఎవరికీ పంపవద్దు.
3. Firestore Database > Rules లో ఉన్న firestore.rules ఫైల్‌లోని నియమాలను కాపీ చేసి Publish చేయండి.
4. ఈ ఫోల్డర్‌ను HTTPS ద్వారా హోస్ట్ చేయాలి. index.html ను నేరుగా file:// ద్వారా తెరిస్తే Firebase module imports పనిచేయకపోవచ్చు.

గమనిక:
- మీ Firebase project config ఈ యాప్‌లో చేర్చబడింది.
- Firebase web API key సాధారణంగా వెబ్ యాప్‌లో కనిపించే config విలువ; అయినా Firebase Console లో API restrictions పెట్టడం మంచిది.
- ఆర్డర్లు చదవడం/మార్చడం అడ్మిన్ ఇమెయిల్‌తో లాగిన్ అయిన ఖాతాకే అనుమతి.
- కస్టమర్ ఆర్డర్ పంపగలరు; లైవ్‌లో పెట్టే ముందు rules ను జాగ్రత్తగా తనిఖీ చేయండి.
- ఇది PWA ప్రారంభ వెర్షన్ మాత్రమే; Play Store APK కాదు.
