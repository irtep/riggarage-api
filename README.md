# riggarage-api
API for my Rig Garage app

npm run dev

npm run build

# API Endpoints:

    POST /api/auth/login - Login

    POST /api/auth/register - Register

    POST /api/auth/logout - Logout

    GET /api/auth/me - Get current user

    GET curl http://localhost:5509/api/auth - all users

    DELETE curl -X DELETE http://localhost:5509/api/auth/petri

    PUT

curl -X PUT http://localhost:5509/api/auth/id/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_HERE" \
  -d '{"admin": true}'
