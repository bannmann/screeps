const NAME_REGEX = /^[WE]([0-9]+)[NS]([0-9]+)$/;

/**
 * These functions are placed here instead of the Room prototype because they are intended for path finding where you
 * do not have Room instances for every room.
 */
module.exports = {
    hasSourceKeepers: function(roomName) {
        function isMiddleOfSector(coordinate) {
            var positionInSector = coordinate % 10;
            return positionInSector >= 4 && positionInSector <= 6;
        }

        var parsed = NAME_REGEX.exec(roomName);
        return isMiddleOfSector(parsed[1]) && isMiddleOfSector(parsed[2]);
    },

    isHighway: function(roomName) {
        var parsed = NAME_REGEX.exec(roomName);
        return (parsed[1] % 10 === 0) || (parsed[2] % 10 === 0);
    }
};