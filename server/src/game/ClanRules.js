function canPlaceTotem(player, clan) {
  return !!player && !!clan && typeof player.id === "string" &&
    player.clanId === clan.id && clan.leaderId === player.id;
}

module.exports = { canPlaceTotem };
