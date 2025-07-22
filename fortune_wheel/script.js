// HTML 요소들을 JavaScript 변수로 가져옵니다.
// 이 변수들을 통해 HTML 요소에 접근하고 조작할 수 있습니다.
const canvas = document.getElementById('wheelCanvas'); // 휠이 그려질 캔버스 요소
const ctx = canvas.getContext('2d'); // 캔버스에 그림을 그릴 때 사용하는 2D 렌더링 컨텍스트
const spinButton = document.getElementById('spinButton'); // '시작' 버튼
const stopButton = document.getElementById('stopButton'); // '정지' 버튼
const resultText = document.getElementById('resultText'); // 결과 텍스트를 표시할 요소
const sectorListDiv = document.getElementById('sectorList'); // 섹터 목록을 표시할 div
const newSectorNameInput = document.getElementById('newSectorName'); // 새 섹터 이름 입력 필드
const newSectorWeightInput = document.getElementById('newSectorWeight'); // 새 섹터 비율 입력 필드
const newSectorColorInput = document.getElementById('newSectorColor'); // 새 섹터 색상 입력 필드
const addSectorButton = document.getElementById('addSectorButton'); // '섹터 추가' 버튼
const resetSectorsButton = document.getElementById('resetSectorsButton'); // '기본 섹터로 재설정' 버튼

// 휠의 중심과 반지름을 계산합니다.
// 캔버스 크기에 따라 동적으로 계산됩니다.
const wheelRadius = canvas.width / 2 - 10; // 휠의 반지름 (캔버스 너비의 절반에서 약간의 여백을 뺌)
const centerX = canvas.width / 2; // 캔버스 중앙의 X 좌표
const centerY = canvas.height / 2; // 캔버스 중앙의 Y 좌표

// 기본 섹터 데이터를 정의합니다.
// 각 섹터는 이름, 가중치(비율), 색상을 가집니다.
let defaultSectors = [
    { name: '꽝', weight: 50, color: '#FF6347' }, // 50% 확률의 '꽝' 섹터 (토마토 색)
    { name: '10% 세일', weight: 25, color: '#FFD700' }, // 25% 확률의 '10% 세일' 섹터 (골드 색)
    { name: '50% 세일', weight: 10, color: '#32CD32' }, // 10% 확률의 '50% 세일' 섹터 (라임 그린 색)
    { name: '공짜', weight: 15, color: '#1E90FF' }  // 15% 확률의 '공짜' 섹터 (다저 블루 색)
];

// 현재 사용될 섹터 데이터를 저장하는 변수입니다.
// defaultSectors를 깊은 복사하여 초기화합니다. (원본 데이터가 변경되지 않도록)
let currentSectors = JSON.parse(JSON.stringify(defaultSectors));

// 휠 회전 관련 변수들
let spinAngle = 0; // 휠의 현재 회전 각도
let spinSpeed = 0; // 휠의 현재 회전 속도
const maxSpinSpeed = 0.2; // 최대 회전 속도 (초당 라디안)
const decelerationRate = 0.001; // 감속률 (휠이 멈추는 속도)
let isSpinning = false; // 휠이 현재 회전 중인지 여부를 나타내는 플래그
let animationFrameId = null; // requestAnimationFrame의 ID (애니메이션 중지 시 사용)

// 휠을 그리는 함수
function drawWheel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 캔버스 전체를 지웁니다.

    // 현재 섹터가 하나도 없으면 휠을 그리지 않고 화살표만 그립니다.
    if (currentSectors.length === 0) {
        drawArrow(); // 섹터가 없어도 화살표는 그립니다.
        return; // 휠 그리기 중단
    }

    // 모든 섹터의 가중치(비율) 합계를 계산합니다.
    let totalWeight = currentSectors.reduce((sum, sector) => sum + sector.weight, 0);
    let startAngle = 0; // 각 섹터가 시작하는 각도

    // 각 섹터를 순회하며 휠에 그립니다.
    currentSectors.forEach(sector => {
        // 섹터의 크기를 결정하는 각도를 계산합니다. (전체 원의 2파이 라디안 중 해당 섹터의 비율)
        let arcAngle = (sector.weight / totalWeight) * Math.PI * 2;
        let endAngle = startAngle + arcAngle; // 섹터가 끝나는 각도

        ctx.beginPath(); // 새로운 경로를 시작합니다.
        // 원의 중심, 반지름, 시작 각도, 끝 각도를 사용하여 호를 그립니다.
        // spinAngle을 더하여 휠이 회전하는 것처럼 보이게 합니다.
        ctx.arc(centerX, centerY, wheelRadius, startAngle + spinAngle, endAngle + spinAngle);
        ctx.lineTo(centerX, centerY); // 호의 끝에서 중심까지 선을 그려 파이 조각을 만듭니다.
        ctx.fillStyle = sector.color; // 섹터의 색상으로 채웁니다.
        ctx.fill(); // 경로를 채웁니다.
        ctx.closePath(); // 경로를 닫습니다.

        // 섹터 텍스트를 그립니다.
        ctx.save(); // 현재 캔버스 상태를 저장합니다.
        ctx.translate(centerX, centerY); // 캔버스 원점을 휠의 중심으로 이동합니다.
        // 텍스트를 섹터의 중앙에 오도록 회전시킵니다.
        ctx.rotate(startAngle + spinAngle + arcAngle / 2); 
        ctx.textAlign = 'right'; // 텍스트 정렬을 오른쪽으로 설정합니다.
        ctx.fillStyle = '#fff'; // 텍스트 색상을 흰색으로 설정합니다.
        ctx.font = 'bold 16px Arial'; // 텍스트 폰트와 크기를 설정합니다.
        ctx.fillText(sector.name, wheelRadius - 20, 0); // 섹터 이름을 그립니다. (반지름에서 20px 안쪽)
        ctx.restore(); // 저장된 캔버스 상태를 복원합니다.

        startAngle = endAngle; // 다음 섹터의 시작 각도를 현재 섹터의 끝 각도로 설정합니다.
    });

    // 휠 중앙에 작은 원을 그립니다.
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#333'; // 어두운 회색으로 채웁니다.
    ctx.fill();
    ctx.closePath();

    // 고정된 화살표를 그립니다.
    drawArrow();
}

// 휠 상단에 고정된 화살표를 그리는 함수
function drawArrow() {
    ctx.save(); // 현재 캔버스 상태를 저장합니다.
    ctx.translate(centerX, centerY); // 캔버스 원점을 휠의 중심으로 이동합니다.
    ctx.rotate(-Math.PI / 2); // 화살표가 위쪽(12시 방향)을 향하도록 캔버스를 회전시킵니다.

    ctx.beginPath(); // 새로운 경로를 시작합니다.
    ctx.moveTo(0, -(wheelRadius + 10)); // 휠 바깥쪽 상단에서 시작
    ctx.lineTo(-15, -(wheelRadius - 5)); // 왼쪽 아래로 선
    ctx.lineTo(15, -(wheelRadius - 5)); // 오른쪽 아래로 선
    ctx.closePath(); // 경로를 닫아 삼각형을 만듭니다.
    ctx.fillStyle = '#FF0000'; // 빨간색으로 채웁니다.
    ctx.fill(); // 경로를 채웁니다.
    ctx.restore(); // 저장된 캔버스 상태를 복원합니다.
}

// 애니메이션 루프 함수
function animate() {
    if (isSpinning) {
        // 휠이 회전 중일 때
        spinAngle += spinSpeed; // 현재 회전 각도에 속도를 더합니다.
        if (spinSpeed < maxSpinSpeed) {
            spinSpeed += 0.001; // 속도를 점진적으로 가속합니다.
        }
    } else {
        // 휠이 정지 중일 때 (감속)
        spinSpeed -= decelerationRate; // 속도를 점진적으로 감속합니다.
        if (spinSpeed <= 0) {
            // 속도가 0이 되면 휠이 완전히 멈춘 것입니다.
            spinSpeed = 0; // 속도를 0으로 고정
            cancelAnimationFrame(animationFrameId); // 애니메이션 루프를 중지합니다.
            getWinner(); // 당첨 섹터를 결정합니다.
            spinButton.disabled = false; // '시작' 버튼을 다시 활성화합니다.
            stopButton.disabled = true; // '정지' 버튼을 비활성화합니다.
            return; // 함수 실행을 종료합니다.
        }
        spinAngle += spinSpeed; // 감속 중에도 휠을 계속 회전시킵니다.
    }

    drawWheel(); // 휠을 다시 그립니다.
    animationFrameId = requestAnimationFrame(animate); // 다음 프레임에서 animate 함수를 다시 호출합니다.
}

// 휠 회전을 시작하는 함수
function startSpin() {
    if (isSpinning) return; // 이미 회전 중이면 아무것도 하지 않습니다.
    isSpinning = true; // 회전 중 상태로 설정합니다.
    spinSpeed = 0.05; // 초기 회전 속도를 설정합니다.
    resultText.textContent = ''; // 이전 결과 텍스트를 지웁니다.
    spinButton.disabled = true; // '시작' 버튼을 비활성화합니다.
    stopButton.disabled = false; // '정지' 버튼을 활성화합니다.
    animationFrameId = requestAnimationFrame(animate); // 애니메이션 루프를 시작합니다.
}

// 휠 회전을 멈추는 함수
function stopSpin() {
    if (!isSpinning) return; // 회전 중이 아니면 아무것도 하지 않습니다.
    isSpinning = false; // 회전 중이 아님 상태로 설정합니다. (감속 로직은 animate 함수에서 처리됩니다.)
}

// 당첨 섹터를 결정하는 함수
function getWinner() {
    // 섹터가 없으면 당첨자를 결정할 수 없습니다.
    if (currentSectors.length === 0) {
        resultText.textContent = '섹터가 없습니다. 섹터를 추가해주세요.';
        return;
    }

    // 화살표가 가리키는 각도를 계산합니다.
    // 캔버스 상단 중앙(12시 방향)이 화살표의 위치입니다.
    // 휠의 0도 위치는 오른쪽(3시 방향)이므로, 이를 보정하여 화살표가 가리키는 휠의 상대적인 각도를 찾습니다.
    let normalizedSpinAngle = (spinAngle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2); // 0 ~ 2π 범위로 정규화된 회전 각도
    // 화살표가 가리키는 휠의 각도 계산: (2π - 현재 회전 각도 + 화살표 보정 각도) % 2π
    let arrowAngle = (Math.PI * 2 - normalizedSpinAngle + Math.PI / 2) % (Math.PI * 2);

    let totalWeight = currentSectors.reduce((sum, sector) => sum + sector.weight, 0); // 총 가중치
    let currentAngle = 0; // 현재까지의 섹터 각도 합계
    let winner = null; // 당첨 섹터

    // 각 섹터를 순회하며 화살표가 어떤 섹터를 가리키는지 확인합니다.
    for (let i = 0; i < currentSectors.length; i++) {
        let sector = currentSectors[i];
        let arcAngle = (sector.weight / totalWeight) * Math.PI * 2; // 해당 섹터의 각도 크기
        let endAngle = currentAngle + arcAngle; // 해당 섹터의 끝 각도

        // 화살표 각도가 현재 섹터의 시작 각도와 끝 각도 사이에 있으면 해당 섹터가 당첨입니다.
        if (arrowAngle >= currentAngle && arrowAngle < endAngle) {
            winner = sector;
            break; // 당첨 섹터를 찾았으므로 반복을 중단합니다.
        }
        currentAngle = endAngle; // 다음 섹터를 위해 현재 각도를 업데이트합니다.
    }

    // 당첨 섹터가 있으면 결과를 표시합니다.
    if (winner) {
        resultText.textContent = winner.name;
    } else {
        resultText.textContent = '오류: 당첨 섹터를 찾을 수 없습니다.'; // 오류 메시지
    }
}

// 섹터 목록을 HTML에 렌더링하는 함수
function renderSectorList() {
    sectorListDiv.innerHTML = ''; // 기존 목록을 모두 지웁니다.
    currentSectors.forEach((sector, index) => {
        const sectorDiv = document.createElement('div'); // 새 div 요소를 생성합니다.
        // 섹터 이름, 비율, 색상, 그리고 삭제 버튼을 포함하는 HTML을 설정합니다.
        sectorDiv.innerHTML = `
            <span style="color: ${sector.color};">${sector.name} (${sector.weight}%)</span>
            <button class="delete-sector" data-index="${index}">삭제</button>
        `;
        sectorListDiv.appendChild(sectorDiv); // 생성된 div를 섹터 목록 div에 추가합니다.
    });

    // 각 '삭제' 버튼에 이벤트 리스너를 추가합니다.
    document.querySelectorAll('.delete-sector').forEach(button => {
        button.addEventListener('click', (event) => {
            const index = parseInt(event.target.dataset.index); // data-index 속성에서 인덱스를 가져옵니다.
            deleteSector(index); // 해당 인덱스의 섹터를 삭제합니다.
        });
    });
}

// 새 섹터를 추가하는 함수
function addSector() {
    const name = newSectorNameInput.value.trim(); // 입력된 섹터 이름 (공백 제거)
    const weight = parseInt(newSectorWeightInput.value); // 입력된 섹터 비율 (정수로 변환)
    const color = newSectorColorInput.value; // 입력된 섹터 색상

    // 입력 유효성 검사: 이름이 비어있거나, 비율이 숫자가 아니거나, 0보다 작거나 같으면 경고합니다.
    if (!name || isNaN(weight) || weight <= 0) {
        alert('유효한 섹터 이름과 양의 비율을 입력해주세요.');
        return;
    }

    // 현재 섹터들의 총 가중치를 계산합니다.
    let totalCurrentWeight = currentSectors.reduce((sum, sector) => sum + sector.weight, 0);
    // 새 섹터를 추가했을 때 총 가중치가 100%를 초과하면 경고합니다.
    if (totalCurrentWeight + weight > 100) {
        alert(`총 비율이 100%를 초과합니다. 현재: ${totalCurrentWeight}%, 추가하려는 비율: ${weight}%`);
        return;
    }

    // 새 섹터 객체를 생성하여 currentSectors 배열에 추가합니다.
    currentSectors.push({ name: name, weight: weight, color: color });
    
    // 입력 필드를 초기화합니다.
    newSectorNameInput.value = '';
    newSectorWeightInput.value = '';
    newSectorColorInput.value = '#FF0000'; // 색상 선택기를 기본 빨간색으로 재설정
    
    renderSectorList(); // 섹터 목록을 다시 그립니다.
    drawWheel(); // 휠을 다시 그립니다.
}

// 섹터를 삭제하는 함수
function deleteSector(index) {
    // splice 메서드를 사용하여 해당 인덱스의 섹터를 배열에서 제거합니다.
    // 이제 섹터가 하나도 없어도 오류가 발생하지 않습니다.
    currentSectors.splice(index, 1);
    renderSectorList(); // 섹터 목록을 다시 그립니다.
    drawWheel(); // 휠을 다시 그립니다.
}

// 섹터를 기본값으로 재설정하는 함수
function resetSectors() {
    // defaultSectors를 깊은 복사하여 currentSectors에 할당합니다.
    currentSectors = JSON.parse(JSON.stringify(defaultSectors));
    renderSectorList(); // 섹터 목록을 다시 그립니다.
    drawWheel(); // 휠을 다시 그립니다.
}


// 이벤트 리스너 설정
// 각 버튼 클릭 시 해당 함수를 실행하도록 연결합니다.
spinButton.addEventListener('click', startSpin);
stopButton.addEventListener('click', stopSpin);
addSectorButton.addEventListener('click', addSector);
resetSectorsButton.addEventListener('click', resetSectors);

// 초기 설정 및 휠 그리기
drawWheel(); // 페이지 로드 시 휠을 한 번 그립니다.
renderSectorList(); // 페이지 로드 시 섹터 목록을 렌더링합니다.
stopButton.disabled = true; // 초기에는 '정지' 버튼을 비활성화합니다. (회전 중이 아닐 때)