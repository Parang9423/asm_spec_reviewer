# AI Spec Review System

React + FastAPI 기반 AI Spec Review 초기 프로젝트입니다.

## 기능

- RMS Spec JSON 업로드
- AI_Code별 AI Spec 파싱 및 목록 표시
- General Spec 원문 입력
- General Spec 구조화 조건 입력
- 비교불가 조건 입력
- 자동 비교 실행
- Review / 협의 이력 저장
- history.json 조회

## 실행

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
PYTHONPATH=. uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속.

## 테스트

```bash
cd backend
PYTHONPATH=. pytest ../tests

cd ../frontend
npm install
npm run build
```

## 저장 파일

- `data/spec_store.json`: 업로드된 RMS Spec 파싱 결과
- `data/general_spec.json`: General Spec 입력/구조화 데이터
- `data/history.json`: Review / 협의 이력
