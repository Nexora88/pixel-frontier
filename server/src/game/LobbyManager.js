const DEFAULT_CAPACITY=60;
class LobbyManager{
 constructor({capacity=DEFAULT_CAPACITY,createWorld=(id)=>({id})}={}){if(!Number.isInteger(capacity)||capacity<1)throw new Error("invalid-lobby-capacity");this.capacity=capacity;this.createWorld=createWorld;this.lobbies=new Map();this.nextId=1}
 allocate(playerId){if(typeof playerId!=="string"||!playerId)return{ok:false,reason:"invalid-player"};for(const lobby of this.lobbies.values())if(lobby.players.has(playerId))return{ok:true,lobbyId:lobby.id,world:lobby.world,existing:true};let lobby=[...this.lobbies.values()].find(item=>item.status==="open"&&item.players.size<this.capacity);if(!lobby){const id=`world_${this.nextId++}`;lobby={id,world:this.createWorld(id),players:new Set(),status:"open",createdAt:Date.now()};this.lobbies.set(id,lobby)}lobby.players.add(playerId);if(lobby.players.size>=this.capacity)lobby.status="full";return{ok:true,lobbyId:lobby.id,world:lobby.world,existing:false}}
 release(playerId){for(const lobby of this.lobbies.values())if(lobby.players.delete(playerId)){if(lobby.status==="full")lobby.status="open";if(lobby.players.size===0)this.lobbies.delete(lobby.id);return true}return false}
 summary(){return[...this.lobbies.values()].map(l=>({id:l.id,count:l.players.size,capacity:this.capacity,status:l.status}))}
}
module.exports={LobbyManager,DEFAULT_LOBBY_CAPACITY:DEFAULT_CAPACITY};
