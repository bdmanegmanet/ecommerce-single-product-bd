# বাংলাদেশি Single Product E-commerce System

এটি Vanilla HTML/CSS/JavaScript এবং Google Apps Script + Google Sheets-ভিত্তিক COD অর্ডার সিস্টেম।

## ফাইল
`index.html` customer landing page, `admin.html` dashboard, `style.css` design, `app.js` storefront logic, `location-data.js` dependent locations, `admin.js` admin UI এবং `Code.gs` backend।

## Google Sheets তৈরি
একটি spreadsheet-এ এই ছয়টি sheet তৈরি করুন। প্রথম row-তে ঠিক নিচের header বসান (প্রতিটি `|` আলাদা column):

**Orders**
`Order ID | Created At | Updated At | Customer Name | Phone | Division | District | Upazila | Full Address | Product Name | Variant | Color | Size | Quantity | Unit Price | Subtotal | Discount | Delivery Charge | Total Amount | Payment Method | Order Status | Customer Note | Admin Note | Client Request ID`

**Settings**: `Key | Value`

**Admins**: `Admin ID | Username | Password Hash | Role | Active | Created At`

**Reviews**: `ID | Customer Name | Rating | Review | Image | Active | Created At`

**FAQ**: `ID | Question | Answer | Active | Sort Order`

**Products**: `Product ID | Name | Description | Original Price | Sale Price | Discount | Stock | Active`

Settings-এ অন্তত `PRODUCT_NAME`, `SALE_PRICE`, `ORIGINAL_PRICE`, `INSIDE_DHAKA_DELIVERY`, `OUTSIDE_DHAKA_DELIVERY` এবং `WHATSAPP_NUMBER` দিন।

## Apps Script
1. Extensions → Apps Script খুলুন এবং `Code.gs` paste করুন।
2. `SPREADSHEET_ID`-তে spreadsheet URL-এর ID বসান।
3. Project Settings-এ timezone `Asia/Dhaka` দিন।
4. SHA-256 hash তৈরি করে Admins sheet-এ password hash দিন। Apps Script editor-এ temporary helper হিসেবে `Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,'আপনার-পাসওয়ার্ড',Utilities.Charset.UTF_8)` চালিয়ে hex বানাতে পারেন; production-এ plain password রাখবেন না।
5. Deploy → New deployment → Web app; Execute as **Me**। Public order flow-এর জন্য access এমন রাখুন যাতে customer request করতে পারে; organization policy অনুযায়ী least-permissive option বাছুন।
6. Web App `/exec` URL কপি করুন।

Apps Script Web App direct cross-origin request-এ browser preflight/CORS সীমাবদ্ধতা থাকতে পারে। Frontend ইচ্ছাকৃতভাবে `text/plain` body পাঠায় যাতে OPTIONS preflight এড়ানো যায়। Deployment-এর access এবং URL অবশ্যই বাস্তবে test করুন।

## Frontend config
`app.js`-এর `APP_CONFIG.apiUrl`-এ Web App URL দিন। একই ফাইলে store name, WhatsApp number এবং product images/দাম পরিবর্তন করুন। Delivery charge `DELIVERY_CONFIG`-এ এবং backend-এর Settings sheet-এ মিলিয়ে রাখুন; backend-ই authoritative। নিজের product images `assets/images/`-এ রাখুন।

## Hosting
GitHub Pages-এ repository Settings → Pages → Deploy from branch। Netlify-তে repository import করুন। Render Static Site-এ এই repo দিন এবং build command ফাঁকা, publish directory `.` দিন। Cloudflare Pages-এ Git integration ব্যবহার করুন। `Code.gs` কখনো public frontend-এ প্রকাশ করবেন না।

## Admin
`/admin.html` খুলে Admins sheet-এর username/password hash দিয়ে login করুন। Token sessionStorage-এ থাকে, password কখনো সংরক্ষিত হয় না। Status এবং note backend token যাচাইয়ের পরই update হয়। Static UI-তে password hardcode করা হয়নি।

## Test checklist
- API URL বসিয়ে customer order দিন এবং Orders row যাচাই করুন।
- একই client request পুনরায় পাঠালে duplicate rejection যাচাই করুন।
- ঢাকা/বাইরের delivery, quantity এবং phone formats test করুন।
- Admin login, wrong password, order search, filter, status, note ও CSV test করুন।
- Mobile viewport-এ sticky CTA, gallery swipe, keyboard labels এবং success WhatsApp link পরীক্ষা করুন।

## নিরাপত্তা ও troubleshooting
Spreadsheet ID ও admin hash client code-এ দেবেন না। Apps Script access ভুল হলে `অর্ডার পাঠানো যায়নি` দেখা যাবে—deployment permission, `/exec` URL এবং browser Network response দেখুন। Code.gs-এর generic errors customer-কে stack trace দেয় না। Production-এর আগে abuse/rate limiting, domain restrictions, backup এবং Google account 2FA চালু করুন।
