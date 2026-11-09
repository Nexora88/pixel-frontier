function sameSide(a,b){if(!a||!b)return false;if(a.id===b.id)return true;if(a.clanId&&b.clanId&&a.clanId===b.clanId)return true;if(a.factionId&&b.factionId&&a.factionId===b.factionId)return true;return false}
function canDamage(attacker,target,{friendlyFire=false,safeZone=false}={}){if(!attacker||!target||attacker.id===target.id)return false;if(safeZone)return false;if(!friendlyFire&&sameSide(attacker,target))return false;return true}
module.exports={sameSide,canDamage};
