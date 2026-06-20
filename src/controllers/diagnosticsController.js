const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const ping = (req, res) => {
    const ip = req.body.ip;

    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    
    if (!ip || !ipRegex.test(ip)) {
        return res.status(400).send('denined4.');
    }

    const command = `ping -c 4 ${ip}`;

    console.log(`Executing safe command: ${command}`);

    exec(command, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).send(`Lỗi thực thi: ${error.message}`);
        }
        res.send(stdout || stderr);
    });
};

const getLogFile = (req, res) => {
    const { file } = req.query;

    if (!file) {
        return res.status(400).send('Tên file là bắt buộc.');
    }

    const safeFilename = path.basename(file); 
    const filePath = path.join(__dirname, '..', 'logs', safeFilename);

    console.log(`Attempting to serve safe file: ${filePath}`);

    res.sendFile(filePath, (err) => {
        if (err) res.status(404).send('Không tìm thấy file log.');
    });
};

const clearLogs = (req, res) => {
    const logFilePath = path.join(__dirname, '..', '..', 'activity.log');

    if (!fs.existsSync(logFilePath)) {
        fs.writeFileSync(logFilePath, 'USER_LOGIN: admin - 2024-01-01 10:00:00\nCOMMAND_EXECUTED: ls -la - 2024-01-01 10:05:00\n');
    }

    fs.unlink(logFilePath, (err) => {
        if (err) {
            return res.status(500).json({ message: 'Không thể xoá file log.', error: err.message });
        }

        
    });
};

module.exports = { ping, getLogFile, clearLogs };