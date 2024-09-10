// vite-env.d.ts
interface ImportMetaEnv {
    readonly VITE_MAPTILER_KEY: string;
    // 사용하고 있는 환경 변수들을 정의
    // 다른 환경 변수가 있다면 여기에 추가
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  