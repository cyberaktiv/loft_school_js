module.exports = {
    currentDate() {
        let date = new Date();
    
        let [year, month, day, hours, minutes, seconds] = [
            date.getFullYear(),
            ('0' + (date.getMonth() + 1)).slice(-2),
            ('0' + date.getDate()).slice(-2),
            (('0' + date.getHours()).slice(-2)),
            (('0' + date.getMinutes()).slice(-2)),
            (('0' + date.getSeconds()).slice(-2))
        ];

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;        
    },
    getOffsetPosition(e) {
        let target = e.target || e.srcElement,
            rect = target.getBoundingClientRect();

        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        }
    }
};