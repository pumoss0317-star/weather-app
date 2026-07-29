# 天気予報アプリ

都市名または現在地から、気温・天気・湿度・降水確率をカレンダーで日付を切り替えながら確認できるアプリです。[Next.js](https://nextjs.org)（App Router）+ [OpenWeatherMap API](https://openweathermap.org/api) を使用しています。

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. OpenWeatherMap APIキーの取得

1. https://home.openweathermap.org/users/sign_up でアカウント作成（クレジットカード不要）
2. 確認メールのリンクをクリックしてメール認証
3. ログイン後、右上のユーザー名 →「My API keys」タブでキーを確認（自動生成された`Default`キーでOK）
4. 発行直後は反映まで最大2時間ほどかかる場合があります

### 3. 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成し、取得したキーを設定します。

```bash
cp .env.local.example .env.local
```

```
OPENWEATHER_API_KEY=あなたのAPIキー
```

`.env.local` は `.gitignore` 対象のため、コミットされません。

### 4. 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 を開いて確認してください。

## デプロイ（Vercel）

1. Vercelにプロジェクトをインポート
2. Project Settings → Environment Variables に `OPENWEATHER_API_KEY` を設定
3. デプロイを実行

## 技術構成

- Next.js 16 (App Router) / TypeScript / Tailwind CSS
- `app/api/weather/route.ts`: OpenWeatherMapの「現在の天気」「5日間/3時間ごと予報」APIをサーバー側で呼び出すRoute Handler（APIキーはここでのみ参照）
- `components/Calendar.tsx`: 予報が取得できる日付のみ選択可能な自作カレンダー
- `components/WeatherCard.tsx`: 選択日の気温・天気・湿度・降水確率を表示
