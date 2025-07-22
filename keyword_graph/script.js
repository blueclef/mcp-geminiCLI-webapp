document.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('keywordChart').getContext('2d');

    // 1. 임의의 검색어 10개 생성
    const keywords = [
        '인공지능', '빅데이터', '클라우드 컴퓨팅', '메타버스', '블록체인',
        '웹 3.0', '자율주행', '양자컴퓨팅', '사물인터넷', '사이버보안'
    ];

    // 2. 30일 날짜 라벨 생성
    const labels = [];
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        labels.push(`${d.getMonth() + 1}월 ${d.getDate()}일`);
    }

    // 3. 각 검색어에 대한 30일간의 임의 조회수 데이터 생성
    const datasets = keywords.map(keyword => {
        const data = [];
        let lastValue = Math.random() * 500 + 50; // 시작값
        for (let i = 0; i < 30; i++) {
            // 이전 값에서 크게 벗어나지 않도록 변동폭 조절
            const fluctuation = (Math.random() - 0.5) * 50;
            lastValue = Math.max(0, lastValue + fluctuation); // 0 미만으로 내려가지 않도록
            data.push(lastValue);
        }
        const color = `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.7)`;
        return {
            label: keyword,
            data: data,
            borderColor: color,
            backgroundColor: color + '20', // 투명도 추가
            fill: false,
            tension: 0.1
        };
    });

    // 4. Chart.js를 사용하여 그래프 생성
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'IT 기술 검색어 트렌드 (가상 데이터)'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '가상 조회수'
                    }
                }
            }
        }
    });
});
