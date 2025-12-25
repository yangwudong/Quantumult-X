// Bilibili Player API VIP Modifier
// For use with Shadowrocket module
// URL pattern: https://api.bilibili.com/x/player/wbi/v2

console.log(`Bilibili request matched - Jack Yang`);
console.log(`Request URL: ${$request.url}`);
console.log(`Response body: ${$response.body}`);

const url = $request.url;
let body = $response.body;

if (/https?:\/\/api\.bilibili\.com\/x\/player\/wbi\/v2/.test(url)) {
  try {
    let obj = JSON.parse(body);
    
    // Check if the response has the expected structure
    if (obj.data && obj.data.vip) {
      // Modify VIP status to premium
      obj.data.vip.type = 2;                    // VIP type: 2 = premium
      obj.data.vip.status = 1;                  // Status: 1 = active
      obj.data.vip.vip_pay_type = 1;            // Payment type
      obj.data.vip.due_date = 4669824160000;    // Expiry date (far future, in milliseconds)
      
      // Optional: Update other VIP-related fields
      obj.data.vip.role = 3;                    // VIP role
      obj.data.vip.tv_vip_status = 1;           // TV VIP status
      obj.data.vip.tv_vip_pay_type = 1;         // TV VIP payment type
      
      body = JSON.stringify(obj);
      console.log("Bilibili Player VIP status modified successfully");
    }
  } catch (err) {
    console.log("Error modifying Bilibili Player response: " + err);
  }
}

$done({ body });