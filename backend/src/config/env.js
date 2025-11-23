
export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://viyashviyashan:iAc2OUOFuwawg9Mw@smartpark.sr4npop.mongodb.net/?retryWrites=true&w=majority&appName=smartPark',
  JWT_SECRET: process.env.JWT_SECRET || 'smart_parking_secure_jwt_secret_2025',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  EMAIL_USER: process.env.EMAIL_USER || 'viyashviyashan24@gmail.com',
  EMAIL_PASS: process.env.EMAIL_PASS || 'fgfz mstp kkhi qwgm',  
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@gmail.com',
  ADMIN_EMAIL_ALLOWLIST: process.env.ADMIN_EMAIL_ALLOWLIST || process.env.ADMIN_EMAIL || 'admin@gmail.com',
  
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || 'smart-parking-a80b9',
  FIREBASE_PRIVATE_KEY_ID: process.env.FIREBASE_PRIVATE_KEY_ID || 'aa3328239ca1990edcc7edce5ddae7b2ef10536e',
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY || "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC57cMcKFjaGCJd\nbTnPLl5eGDnKVmHHcoWOaKNd2bTp6By0HwEJCbc9K48ZjVXQhKUkLUrg2GxdEyxb\nQdDZx5YEt2VaFWotpcdQw7Fb8vCio6YCQarARAHMEK2LFMv5dDtRfKlR47E5dhth\n+s1f0ST0NfjRwaONaa64FaAiTG0lwuHbmItWcjBkgQYWsdA29ePIiLl0DSLSCboj\nYr29KaqZPgL7B12YBVD6tj8pezKDU9FcGKJzPUdpbn+w+ve5e8QPwwEAjB102p45\n3TjqUBoY9au+JiFkLoWAW+FrP1E3sf2NyBuqgDuwS10c7iKavZ0Lo2WFddu2qt/t\nnGW/rvtjAgMBAAECggEAGb6QxgzWJLizxXDy0LuwaGH9WoV0e4vhb1MQz9VtxfeU\nReKHH6u/OhKWeWjHCZzcSvKUjCabdpXJjgdCdm062gNU3tDZR2HNg+Lc44jzhemX\n+ncCQCYKg6mJhhkGl09fSUy0GzkmWHkAmKQEHPDWJ5RzlAO2dEW+YhHofudLM6+Y\nbF3xICtG04J6r1EOfO/SpLyZn6KNGz8rd1qFgm5+E7isqpt6SK+p9D0BeDCHwsD9\nz+gtkRKcYKMQ+6qqkd4DOGo63hL+7iWAlbYLnkjSvFJlLb8iTl4dWgi3R86XdRYt\nZvCmDfm/j4E536ElhE9t+lOIiLfutgOLY2FqXmW8yQKBgQDfPUNq0KedXVMkAPVF\nvfn5zg2VeuWihWBAB+Sk0UswnludI9VRZf7deosLChH18yHxV57Lu8wlq8UI+F1I\n9XSBoIVtDJp2Om7UZKu3irsoxQU953Tko4E8Yze3RTy2teB/3F/OI1hFEcGDvbpa\nBXZLkyhiwxBJY3rTkt02wZkxCQKBgQDVNs1gVSTyubtMi2laN87b3w2Z+RCSr0Bb\nacrVvQZWmPUIx2hM4ODB5s0dRC8b//WZvzfpGl9jdx9E6H/xExZOvI3Q4UIRfqas\nFA7IVCE8KtilsTgrLVyYn0MhoM1Dajrt+7asRVTcKhb95R5zspr4N9lWgq7volOD\nHEd94CLgCwKBgDy3q/uEbuJlPLTBMfTbG/9upNEwUP7oKeqgeva9GidKGv7dfSqb\nhDt3FhRVk9cCXwwGWeFt3bOtSXUMIEs0v5B2OXQUhnp7oCNSkkXkjM0k8S0KJAf/\n1Km5DrFhOoczZrFAHiqyAFMg5jJPyzyq2abqioR6K5baYNDk1BgNhf4JAoGBAJTI\nHSBvycym1pBfaDDQaMT9LVyYdHwnVt1zQVtNADNFoRdzLtEWy0ADcnZNsiHzxsp2\nqOk8wfuCkIthQoZTL2naIYv05EmY+21wwbABJP/7VhqpQ+y9RrQpzoqUzyeP5XdU\nAvDLoJ/RryGU1F8f7wvuzPaVUsVdnLEM9sZbtXppAoGAHh5xauzgIUqKz+Z7t/t0\npbSK3E+Wg+yvHvi9aZBa47QPRx1PCFUqpj8nmR71oV2U6IMX6aaJb2ky7PRwi+y3\n7hwV7sPD1rC11mDwvzsVdvRNVIaLmpVt8vB6u6ze/aGGz8AGerGx05ea7BkdtQYT\nOJYZeqYsmt/1e/aOOogKgE8=\n-----END PRIVATE KEY-----\n",
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@smart-parking-a80b9.iam.gserviceaccount.com',
  FIREBASE_CLIENT_ID: process.env.FIREBASE_CLIENT_ID || '112234913415486114855',
  FIREBASE_CLIENT_CERT_URL: process.env.FIREBASE_CLIENT_CERT_URL || 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40smart-parking-a80b9.iam.gserviceaccount.com',
  
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_51RmDSjPrn4yDohxSkl5YV6mJzkaSPclh2x8CLIezDjDieRPyDAs65Le8T39u2EVIfzT9Ee3bCObxKfAcU7X4uJlg00Le36dWLJ',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || 'sk_test_51RmDSjPrn4yDohxSVDa98VvGrE2fD73rx2SQmYpUjqLiwZQe8I20Vg4flZm6Vvcmj1gtcfBjr69SYkIL3fGPemhQ00U2gL9TqP'
  
};