# Vercel Environment Variables Setup

## 🚀 Add Environment Variables to Vercel

### Step 1: Go to Vercel Dashboard
1. Open: https://vercel.com/dashboard
2. Find your project: **opticommerce-ai**
3. Click on the project
4. Go to **Settings** → **Environment Variables**

### Step 2: Add All Variables
Copy these EXACT values from your `.env.local` file:

#### Firebase Client Variables:
```
Name: NEXT_PUBLIC_FIREBASE_API_KEY
Value: AIzaSyDilzRoRivt5Dc0MYRLrEwzHYE9FbtbOc0
Environment: Production, Preview, Development ✓✓✓
```

```
Name: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
Value: ailistings-50933.firebaseapp.com
Environment: Production, Preview, Development ✓✓✓
```

```
Name: NEXT_PUBLIC_FIREBASE_PROJECT_ID
Value: ailistings-50933
Environment: Production, Preview, Development ✓✓✓
```

```
Name: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
Value: ailistings-50933.firebasestorage.app
Environment: Production, Preview, Development ✓✓✓
```

```
Name: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
Value: 18182645183
Environment: Production, Preview, Development ✓✓✓
```

```
Name: NEXT_PUBLIC_FIREBASE_APP_ID
Value: 1:18182645183:web:45f0db29401829ea31ed0a
Environment: Production, Preview, Development ✓✓✓
```

#### Firebase Admin Variables:
```
Name: FIREBASE_ADMIN_PROJECT_ID
Value: ailistings-50933
Environment: Production, Preview, Development ✓✓✓
```

```
Name: FIREBASE_ADMIN_CLIENT_EMAIL
Value: firebase-adminsdk-fbsvc@ailistings-50933.iam.gserviceaccount.com
Environment: Production, Preview, Development ✓✓✓
```

```
Name: FIREBASE_ADMIN_PRIVATE_KEY
Value: -----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCu+jL7iBKkD9ZJ
F9pQ+KG3QgJjgMzJrDgBvSQYrGGypigo1ONnBxHoL2ur2lWoHUllaPJpCSK2BfUU
sFA6U8H+6nlZGtS5wjhd26TzNlVCpU2iyInTpe3ZXqj+Z6hiklbCqcAe+Z9SXq5D
ykH+C8+FBTFF19Qmo8W3jqlcWcTw+huXiW5owRZVrkO2SXiesQ/EI+IMv5S4IdqO
jzPk93ZYLXW+0Dj64PfHtMgTbmOk4csYxNCa2aJVs1VSV4Cc7UYHxiqcnhYLmEBE
8a6BC/EZDXyOSH4m9wFo3JTUaF0woH+qS86/SG/3orZbQczGj12VEQPncCqZZcsU
ib3ofwFhAgMBAAECggEAE103iqwcqgDhrU2hOMBHP01kD8h3gWMYgKLCraNYHYnz
XE9xChwXcHtc/lQHkjcJghpK53JeH8hJftxjSI0v5SrkOob0X0ld7Q8rckoDRgCe
tqLcU+qjR6DI8XydvyjkRp88FoF4DwjQ3soxovCCKv2v3gOcZBlQPnfgiMqbd7J7
EH5nJVmn1/arnElEWXdSpR2/kyqk4RhHaD8BKqdal9rtQeOxEg9nWL8+9WoFvX6+
lDhLWL0yA6uglrRQBDDWkZcXFgdZgcjtJgv7xr3psOS12jHLmgYycrqoyAb5Yqto
C1tYoycxc8eAQtL0W6OC24Hw9hQkp5RHgH0pozCJEQKBgQDor+ZKB+Fk5oYNEeNh
SnBHQvwbhpFhLTN762epB18zNEo7TCtosJGpGJ+QQrwwTgw08VjS+rUNJEVkN4Qv
cRLTQt40Iq3X4wZWYgS1Noqvb619347/ykALjg15tImUXPxNcneYhs+OgVYUzMLX
tNMGUp4DuSdTKpUbUJRrZqVyeQKBgQDAgh/XYMQejPA62BPuw8JGZu751xCGGAZu
7Q0/0ZWSK+h7zDz0KSYy0gqPVlJ8xh4KLST4jOnUtLPh5dJddp4ODUSg9Ng/mdTZ
CronBOSDjx4WNheO8MHZt4IdNZGg39OBEi4GbbS7V6VE5kNVleRiqOohCGF4d6aM
SFVuczIMKQKBgBjMzqWrS1mevEDeXDa9YVQnDom8gPgzgh4+C9FXKM1jUFoblzDU
SOIV7sPIaRhY6TInWwk5kVxyNjclN6B607/Si65Q1+h/mOhSECBkTMnABGS7FBmt
K8BPhp4nINbARl/WyGpoS+zrWgpjfIzTB/7PhWnuLQPPMQ81OmxsB0w5AoGAH5L4
H/46DHy3Rh98nXO0IJHvbkDs7+Fu5LCytJ3ud0wGVI+6C53YKwuyObJB0z83XBnt
b2rFS2LcAhgMudGjuNBKSk/+S+gyNesBfzbZOA64M5JpqMMqOEhV6e6IVSeA7DGM
JPfHZdbJP5S4xIfSLrBfvk0+l2Cgi2+tu3Dfa4kCgYBSnBU0Ebny1knCsnb9LdkG
oJOgysTofvPGSQ7BYa4BKBZmGyU+q/thYjy6uA3wl2sHLAdBmCpYhC/NM0oX1trS
maIDjs8cYsfXaYZbIrCVCySwgfzK4hkKk7hETsEFbYPWwYJ95dMb8L+AR8z9ockN
bCoZtXR1WuK79rTuA2puPQ==
-----END PRIVATE KEY-----
Environment: Production, Preview, Development ✓✓✓
```

#### Gemini API Variable:
```
Name: GEMINI_API_KEY
Value: AIzaSyDnp802X9ojsWDeH6UcZRtrpgbTpTRAXrg
Environment: Production, Preview, Development ✓✓✓
```

#### Demo Mode (Disable):
```
Name: NEXT_PUBLIC_DEMO_MODE
Value: false
Environment: Production, Preview, Development ✓✓✓
```

### Step 3: Important Notes

#### Private Key Formatting:
- **DO NOT** include quotes around the private key in Vercel
- **DO NOT** include \n characters - Vercel handles newlines automatically
- Just paste the raw key from -----BEGIN to -----END

#### Environment Selection:
- Check **ALL THREE**: Production, Preview, Development
- This ensures the app works in all environments

### Step 4: Save and Deploy
1. Click **Save** after adding each variable
2. Once all variables are added, the deployment will trigger automatically
3. Or manually trigger: `vercel --prod`

## Total Variables to Add: 10
1. NEXT_PUBLIC_FIREBASE_API_KEY
2. NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN  
3. NEXT_PUBLIC_FIREBASE_PROJECT_ID
4. NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
5. NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
6. NEXT_PUBLIC_FIREBASE_APP_ID
7. FIREBASE_ADMIN_PROJECT_ID
8. FIREBASE_ADMIN_CLIENT_EMAIL
9. FIREBASE_ADMIN_PRIVATE_KEY
10. GEMINI_API_KEY
11. NEXT_PUBLIC_DEMO_MODE

After adding all variables, your production app will have:
✅ Real Firebase authentication
✅ Gemini AI optimization  
✅ Persistent user accounts
✅ Full functionality