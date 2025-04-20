// URL API Server
const API_URL = "http://172.31.9.235:5000/data";

// Hàm lấy dữ liệu từ API
async function fetchData() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
}

let temperatureChart, humidityChart, airQualityChart; // Tham chiếu các biểu đồ

async function renderCharts() {
    const data = await fetchData();

    if (data.length === 0) {
        console.warn("No data available to render charts.");
        return;
    }

    // Đảo ngược thứ tự dữ liệu để hiển thị từ mới nhất sang cũ nhất
    const reversedData = data.reverse();

    // Tách dữ liệu
    const timestamps = reversedData.map(item => new Date(item.timestamp).toLocaleString());
    const temperatures = reversedData.map(item => item.temperature);
    const humidities = reversedData.map(item => item.humidity);
    const airQualities = reversedData.map(item => item.air_quality);

    // Kiểm tra và xóa biểu đồ cũ trước khi tạo biểu đồ mới
    if (temperatureChart) temperatureChart.destroy();
    if (humidityChart) humidityChart.destroy();
    if (airQualityChart) airQualityChart.destroy();

    // Biểu đồ nhiệt độ
    const temperatureCtx = document.getElementById('temperatureChart').getContext('2d');
    temperatureChart = new Chart(temperatureCtx, {
        type: 'line',
        data: {
            labels: timestamps,
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatures,
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true, position: 'top' }
            },
            scales: {
                x: { title: { display: true, text: 'Timestamp' } },
                y: { title: { display: true, text: '°C' } }
            }
        }
    });

    // Biểu đồ độ ẩm
    const humidityCtx = document.getElementById('humidityChart').getContext('2d');
    humidityChart = new Chart(humidityCtx, {
        type: 'line',
        data: {
            labels: timestamps,
            datasets: [{
                label: 'Humidity (%)',
                data: humidities,
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true, position: 'top' }
            },
            scales: {
                x: { title: { display: true, text: 'Timestamp' } },
                y: { title: { display: true, text: '%' } }
            }
        }
    });

    // Biểu đồ chất lượng không khí
    const airQualityCtx = document.getElementById('airQualityChart').getContext('2d');
    airQualityChart = new Chart(airQualityCtx, {
        type: 'line',
        data: {
            labels: timestamps,
            datasets: [{
                label: 'Air Quality (PPM)',
                data: airQualities,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true, position: 'top' }
            },
            scales: {
                x: { title: { display: true, text: 'Timestamp' } },
                y: { title: { display: true, text: 'PPM' } }
            }
        }
    });
}

// Gọi hàm render khi tải trang
renderCharts();

// Tự động refresh biểu đồ mỗi 10 giây
setInterval(() => {
    console.log("Refreshing charts...");
    renderCharts(); // Gọi lại hàm renderCharts để cập nhật dữ liệu
}, 10000);