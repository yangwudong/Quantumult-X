console.log(`Office 365 -- Jack Yang - 2025-03-04`);
const headers = $request.headers;

console.log(`request headers: ${JSON.stringify(headers)}`);
console.log('User-Agent: ', headers['User-Agent']);

headers['User-Agent'] = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.75 Safari/537.36";

console.log(`Headers after changing: ${JSON.stringify(headers)}`);

$done({ headers });