# Product Seed Guide

이 폴더는 마켓형 상품 샘플 데이터를 빠르게 넣기 위한 시드 파일을 담습니다.

## 포함 파일

- `products.sample.json`: 상품 기본 정보 + 상세 HTML + 메인/상세 이미지 메타데이터
- `../scripts/seed-products.mjs`: 실제 등록 스크립트

## 실행 방법

1. 백엔드 서버 실행 (`http://localhost:8080` 기준)
2. 관리자 인증 토큰 준비 (Bearer 토큰)
3. 아래 명령 실행

```bash
cd hanspoon_frontend
SEED_ADMIN_TOKEN="YOUR_ADMIN_BEARER_TOKEN" npm run seed:products
```

Windows PowerShell 예시:

```powershell
cd hanspoon_frontend
$env:SEED_ADMIN_TOKEN="YOUR_ADMIN_BEARER_TOKEN"
npm run seed:products
```

## 옵션

- `SEED_BASE_URL` (기본: `http://localhost:8080`)
- `SEED_FILE` (기본: `seed/products.sample.json`)
- `SEED_DRY_RUN=true` (요청 없이 데이터만 점검)
- `SEED_COOKIE` (Bearer 대신 Cookie 인증 사용할 때)

예시:

```bash
SEED_BASE_URL="http://localhost:8080" SEED_DRY_RUN=true npm run seed:products
```

## 이미지 생성 방식

스크립트는 `mainImages`, `detailImages` 메타데이터를 기반으로 SVG 이미지를 동적으로 생성해 업로드합니다.

- 메인 이미지: `1200x1200`
- 상세 이미지: `1200x1600`

## 주의

- 기존 상품과 이름이 중복될 수 있으니 운영 DB에서는 주의해서 사용하세요.
- 시드는 테스트/개발 환경에서 사용하는 것을 권장합니다.