# 🤖 ROS2 Humble 집단지성 학습 메뉴얼

> 누구나 기여할 수 있는 오픈소스 ROS2 Humble 학습 레퍼런스

**사이트 주소**: https://kimhyunin.github.io/ros2_study_helper/

---

## 📖 소개

이 프로젝트는 ROS2 Humble을 배우는 모든 사람이 함께 만들어가는 학습 메뉴얼입니다.
개인 노트로 시작했지만, 더 많은 사람의 경험과 지식이 모일수록 더 좋은 레퍼런스가 됩니다.

**현재 포함된 내용:**
- ROS2 명령어 치트시트
- 핵심 개념 (Node, Topic, Service, Action, TF2, Parameters, Launch)
- 패키지 & 템플릿
- 코드 스니펫 (Python rclpy / C++ rclcpp)
- 학습 체크리스트

---

## ✍️ 기여하는 방법

내용 추가, 오류 수정, 번역 등 모든 기여를 환영합니다.

### 1. 이 저장소를 Fork

우측 상단의 **Fork** 버튼 클릭

### 2. 로컬에 클론

```bash
git clone https://github.com/<내-아이디>/ros2_study_helper.git
cd ros2_study_helper
npm install
```

### 3. 로컬에서 미리보기

```bash
npm run docs:dev
# http://localhost:5173 에서 실시간 확인
```

### 4. 내용 추가 또는 수정

- **기존 페이지 수정**: `docs/` 아래 `.md` 파일을 직접 편집
- **새 페이지 추가**:
  1. `docs/` 에 `.md` 파일 생성
  2. `docs/.vitepress/config.js` 의 `sidebar` 에 항목 추가

```js
// config.js sidebar 예시
{ text: '새 페이지 이름', link: '/폴더/파일명' }
```

### 5. Pull Request 제출

```bash
git add .
git commit -m "add: 내용 설명"
git push origin main
```

GitHub에서 **Pull Request** 버튼 클릭 → 제출

---

## 📁 프로젝트 구조

```
docs/
├── index.md                # 홈 페이지
├── cheatsheet/             # 명령어 치트시트
├── concepts/               # 핵심 개념
│   ├── nodes.md
│   ├── topics.md
│   ├── services.md
│   ├── actions.md
│   ├── tf2.md
│   ├── parameters.md
│   └── launch.md
├── templates/              # 패키지 & Launch 파일 템플릿
├── snippets/               # 코드 스니펫 (Python / C++)
└── checklist/              # 학습 체크리스트
```

---

## 🛠️ 로컬 개발 환경

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run docs:dev

# 빌드
npm run docs:build
```

**요구사항**: Node.js 18 이상

---

## 🤝 기여 가이드라인

- 내용은 **한국어** 기본, 기술 용어는 영어 병기 권장
- 코드 예시는 **ROS2 Humble** 기준으로 작성
- 잘못된 정보를 발견하면 Issue 또는 PR로 알려주세요
- 어떤 기여든 환영합니다 — 오타 수정도 좋습니다!

---

## 📜 라이선스

[MIT License](LICENSE) — 자유롭게 사용, 수정, 배포 가능합니다.
