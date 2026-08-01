# KTP v2

GitHub Pages용 모바일 우선 한국어 라이브러리 초안입니다.

## V2의 핵심 변화

- V1의 베이지/브라운 그래픽 언어 유지
- Today, streak, progress 등 학생용 앱 요소 제거
- Course 구조를 Folder 구조로 변경
- 전체 콘텐츠 내부 검색 지원
- JSON 기반 콘텐츠 관리
- Everyday Sentences:
  - Dialogue
  - Focus
  - Summary
- Vocabulary and Contexts:
  - Contrast
  - Similar
  - Common Senses
  - Idioms
- Third Content:
  - 구상 전까지 구조만 보존

## 폴더 구조

```text
KTP_v2/
├─ index.html
├─ css/
│  └─ main.css
├─ js/
│  └─ app.js
├─ data/
│  ├─ folders.json
│  └─ content.json
└─ assets/
```

## GitHub 업로드

현재 KTP 폴더 아래에서 운영한다면 ZIP을 풀고 파일들을 다음 위치에 배치할 수 있습니다.

```text
KTP/
├─ index.html
├─ css/
├─ js/
├─ data/
└─ assets/
```

기존 파일을 보존하려면 먼저 `KTP/v1/` 또는 별도 브랜치로 복사한 뒤 V2를 올리십시오.

## 로컬 실행

JSON을 `fetch()`로 불러오므로 파일을 직접 더블클릭하지 말고 로컬 서버를 사용하십시오.

```bash
python -m http.server 8000
```

그 뒤 다음 주소로 접속합니다.

```text
http://localhost:8000/KTP_v2/
```

## 콘텐츠 추가

`data/content.json`에 새 객체를 추가하면 검색과 목록에 자동 반영됩니다.

중요 필드:

- `id`: 고유 식별자
- `folder`: `everyday`, `vocabulary`, `third`
- `type`: dialogue, contrast, similar, common sense, idiom 등
- `title`
- `subtitle`
- `tags`
- `blocks`
