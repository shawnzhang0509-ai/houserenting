/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 管理员 URL 口令：?admin=该值 开启删除模式，默认 jiejie */
  readonly VITE_ADMIN_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
