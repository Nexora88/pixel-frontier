require("dotenv").config();
const path=require("node:path");const express=require("express");const http=require("node:http");const{Server}=require("socket.io");const{GameServer}=require("./src/game/GameServer");const{Persistence}=require("./src/db/Persistence");
const app=express(),server=http.createServer(app),io=new Server(server,{maxHttpBufferSize:10000}),persistence=new Persistence(process.env.DATABASE_URL);
app.disable("x-powered-by");app.use(express.static(path.join(__dirname,"..","public")));
app.get("/health",(_req,res)=>res.json({status:"ok",service:"pixel-frontier",uptime:process.uptime(),persistence:persistence.enabled}));
const game=new GameServer(io,{persistence}),port=Number(process.env.PORT||3000);
async function boot(){if(persistence.enabled){await persistence.migrate();await game.restore()}game.start();server.listen(port,()=>console.log(`Pixel Frontier listening on http://localhost:${port}`))}
boot().catch(err=>{console.error("Startup failed:",err);process.exit(1)});
async function shutdown(){game.stop();await game.save().catch(()=>{});await persistence.close().catch(()=>{});io.close();server.close(()=>process.exit(0))}
process.on("SIGINT",shutdown);process.on("SIGTERM",shutdown);
