module.exports = {
    createMessage(type, data = null) {        
        return JSON.stringify({ type, data });
    },
    currentTime() {
        let date = new Date();

        let [hours, minutes] = [
            (('0' + date.getHours()).slice(-2)),
            (('0' + date.getMinutes()).slice(-2))        
        ];

        return `${hours}:${minutes}`;
    }
};