<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Mojang API – Minecraft Server & Skin API

A RESTful API built with [NestJS](https://nestjs.com/) for retrieving Minecraft server status and player skin images by nickname.

---

## Features

- **Get Minecraft server info**: Online status, MOTD, version, players, favicon.
- **Get Minecraft player head**: Retrieve a player's head image as a base64 PNG by nickname.
- **Get full Minecraft skin**: Retrieve the full skin image as a base64 PNG by nickname.

---

## Project Structure

```
mojang_api/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   ├── player/
│   │   ├── player.controller.ts
│   │   ├── player.module.ts
│   │   └── player.service.ts
│   └── server/
│       ├── server.controller.ts
│       ├── server.module.ts
│       └── server.service.ts
├── test/
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── nest-cli.json
├── .gitignore
├── .prettierrc
└── README.md
```

---

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the server:**
   ```bash
   npm run start
   ```
   The API will be available at [http://localhost:3000/](http://localhost:3000/)

3. **API documentation:**  
   Swagger UI is available at the root URL (`/`).

---

## API Endpoints

### Get Minecraft Player Head

```
GET /skin/{nickname}/head?size=50
```

- **nickname**: Minecraft player nickname (required)
- **size**: Image size in pixels (optional, default: 50)

**Response:**
```json
{
  "nickname": "Notch",
  "size": 50,
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

### Get Full Minecraft Skin

```
GET /skin/{nickname}/fullskin
```

- **nickname**: Minecraft player nickname (required)

**Response:**
```json
{
  "nickname": "Notch",
  "image": "data:image/png;base64,..."
}
```

### Get Minecraft Server Info

```
GET /server/{host}?port=25565
```

- **host**: Server IP or domain (required)
- **port**: Server port (optional, default: 25565)

**Response:**
```json
{
  "host": "play.hypixel.net",
  "port": 25565,
  "online": true,
  "version": "Paper 1.21.7",
  "players": {
    "online": 1000,
    "max": 20000,
    "sample": [{ "id": "uuid", "name": "Steve" }]
  },
  "motd": "Welcome to Hypixel!",
  "favicon": "data:image/png;base64,..."
}
```

---

## Testing

- **Unit tests:**  
  ```bash
  npm run test
  ```
- **E2E tests:**  
  ```bash
  npm run test:e2e
  ```

---

## Useful Links

- [NestJS Documentation](https://docs.nestjs.com)
- [Swagger UI](http://localhost:3000/)
- [Project Issues](https://github.com/nestjs/nest/issues)

---
