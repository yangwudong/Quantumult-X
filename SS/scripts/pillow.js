var obj = JSON.parse($response.body);

obj = {
  "request_date": "2022-08-06T02:30:14Z",
  "request_date_ms": 1837536263000,
  "subscriber": {
    "entitlements": {
      "premium": {
        "expires_date": "2099-12-31T23:59:59Z",
        "grace_period_expires_date": null,
        "product_identifier": "com.neybox.pillow.premium.year.v2",
        "purchase_date": "2023-11-14T02:30:14Z"
      }
    },
    "first_seen": "2023-11-14T02:30:14Z",
    "last_seen": "2025-01-14T02:30:14Z",
    "management_url": null,
    "non_subscriptions": {},
    "original_app_user_id": "YOUR_USER_ID",
    "original_application_version": "YOUR_APP_VERSION",
    "original_purchase_date": "2023-11-14T02:30:14Z",
    "other_purchases": {},
    "subscriptions": {
      "com.neybox.pillow.premium.year.v2": {
        "billing_issues_detected_at": null,
        "expires_date": "2099-12-31T23:59:59Z",
        "grace_period_expires_date": null,
        "is_sandbox": false,
        "original_purchase_date": "2023-11-14T02:30:14Z",
        "ownership_type": "PURCHASED",
        "period_type": "active",
        "purchase_date": "2023-11-14T02:30:14Z",
        "store": "app_store",
        "unsubscribe_detected_at": "2023-11-14T02:30:14Z"
      }
    }
  }
};

$done({ "body": JSON.stringify(obj) });
