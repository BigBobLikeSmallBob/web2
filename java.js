const express = require('express');
const { exec } = require('child_process');
const app = express();
const PORT = 8080;

// Sử dụng bộ lọc để phân tích dữ liệu JSON đầu vào
app.use(express.json());

/**
 * Endpoint minh họa tính năng thực thi lệnh từ xa.
 * Trong môi trường thực tế, nếu không có cơ chế xác thực, 
 * endpoint này sẽ biến thành một lỗ hổng RCE hoặc Backdoor nguy hiểm.
 */
app.post('/api/admin/execute', (req, res) => {
    const { command } = req.body;

    if (!command) {
        return res.status(400).json({ error: 'Thiếu tham số lệnh (command).' });
    }

    // Thực thi lệnh hệ điều hành thông qua hàm exec
    exec(command, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ 
                message: 'Thực thi lệnh thất bại', 
                error: error.message 
            });
        }
        
        // Trả kết quả thực thi về cho người gọi API
        res.status(200).json({
            output: stdout || stderr
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server minh họa đang chạy tại cổng ${PORT}`);
});