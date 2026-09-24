# Awesome AI Local Tools 1000

瀏覽器端工具與 AI 實驗集合。**頁面數不等於已完成、已驗證的 AI 功能數。**

## 實作狀態（2026-09-24 稽核）

目前有 **1,001 個子工具頁面**。其中 **412 頁**原本只回傳通用字數統計，並未實作標題描述的功能；現在明確標示「尚未實作」並停用執行。另有模擬示範、瀏覽器 API 工具，以及需要下載模型的整合原型。

完整清單與逐頁狀態：[tool-inventory.json](docs/tool-inventory.json)。修復、測試範圍與未解項目：[Codebase Audit](docs/CODEBASE-AUDIT-2026-09-24.md)。`unverified-implementation` 不是失敗判定，也不是品質認證；表示尚未完成任務正確性的逐項驗收。

## 本地執行與隱私邊界

本專案沒有應用程式後端，但**不能把這件事等同於完全離線或零網路請求**。部分頁面仍從第三方 CDN 載入程式、模型或其他資源，初次載入需要網路；尚未建立完整離線快取或全站資料外傳驗證。

原生語音辨識頁只允許 `processLocally = true`。不支援裝置端辨識或缺少語言套件時，不會退回雲端。音訊檔轉錄頁原本沒有真正推論，現維持示範標示並停用轉錄，不假裝產生逐字稿。API Tester 是明確的網路工具，使用者按下送出後會把請求送至指定網址。

沒有實作通用 IndexedDB 加密、統一模型快取層或全站 Worker 隔離；舊架構說明屬於規劃，見 [歷史提案](docs/architecture-proposal.md)。不要用尚未驗證或模擬的輸出進行醫療、財務或其他重要決策。

## 開發與驗證

需要 Node.js 22+、Python 3.10+。已提交的 `vendor/` 可直接由靜態伺服器提供，訪客不需執行 npm。

```sh
npm ci --ignore-scripts
npm run build:vendor
npm test
npm run audit:site
python3 -m pip install -r verification/requirements.txt
python3 -m playwright install chromium
npm run test:browser
python3 -m http.server 8000
```

瀏覽器測試使用 HTTP 與 GitHub Pages 專案子路徑，不以 `file://` 掩蓋路徑問題。全頁啟動掃描會分別列出通過、失敗與外部依賴未驗證；模型回歸測試使用明確標記的合成輸入／mock，不代表實際模型準確度已驗證。

主頁 `<body>` 與 `<style>` 受雜湊回歸保護，本次只修正主頁 head 內的 discovery 相對路徑，未重新設計主頁。

## English

A collection of browser utilities and AI experiments, not 1,001 certified AI products. The audit identified 412 generic placeholder implementations; they are now disclosed and disabled. Model downloads and some third-party scripts still require network access. Native speech recognition is device-only with no cloud fallback. See the inventory and audit above for exact scope and remaining work.

## 授權與第三方資源

舊版文件標示 MIT，但本次基準版本未附完整根目錄 LICENSE；此缺口保留為待維護者確認事項。模型與第三方套件有各自條款，不能從專案名稱或舊 badge 推定所有資源都能免費商用。建置保留第三方套件授權文件於 `vendor/licenses/`。
