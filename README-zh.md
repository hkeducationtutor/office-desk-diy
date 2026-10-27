# 桌間 · 辦公室桌擺設 DIY

純網頁、繁體中文介面的桌面佈置工具，無需安裝套件。所有執行資源均在此資料夾，運行時不連線。

## 開啟方法

直接雙擊 `index.html`，以支援 WebGL2 的 Chrome、Edge、Firefox 或 Safari 開啟。請保留 `js`、`vendor`、`style.css` 與 HTML 的相對位置。本地傳統 script 載入，不需要 ES module 或網絡 CDN。

亦可以在此資料夾執行：

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

然後瀏覽 `http://127.0.0.1:8080`。結束時在終端機按 Control-C。

## 功能與操作

- 程式生成木桌、螢幕、鍵盤、滑鼠、植物、咖啡杯、枱燈、筆筒、筆記本、玻璃杯。
- 左側按鈕新增擺設；點選物件後直接拖曳，在桌面上移動。
- 右側調整顏色、木／金屬／塑膠／玻璃材質、旋轉、縮放、複製及移除。
- 方向鍵微調選中物件；Q / E 旋轉。拖曳空白處環繞視角，滾輪拉近／拉遠。
- 「儲存／讀取」使用 localStorage；「匯出 JSON」下載可攜場景。「匯入場景」可選檔或貼上 JSON。
- 匯入前驗證全部物件；錯誤資料不會先清空現有場景。上限 60 件，避免過量幾何影響效能。
- 可獨立開關 SSAO 與 Bloom，方便比較畫面或降低負載。

## 渲染技術

Three.js r180，明確建立原生 WebGL2 context。使用 PBR Standard/Physical 材質、roughness/metalness、程式生成立方環境反射、透明與 transmission/IOR/thickness 折射感玻璃、柔化陰影。木紋與螢幕內容均由 Canvas 2D 繪製，再轉成 RGBA DataTexture。

自寫 ShaderMaterial 全螢幕 pass：利用深度重建視空間位置與導數法線，執行 16 點 screen-space ambient occlusion；81 點亮度閾值柔光；ACES 擬合 tone mapping 及 sRGB 輸出。場景 render target 使用最多 4x MSAA（依 GPU 上限）。支援 EXT_color_buffer_float 時使用 HalfFloat HDR，否則退回 8-bit。沒有額外後處理函式庫。

`vendor/three.min.js` 是本機 Three.js 0.180.0 官方 `three.cjs` 加上無依賴的瀏覽器作用域包裝，名稱雖為 min.js，內容未壓縮，以保留易讀性與授權。唯一第三方程式庫為 Three.js；授權見 `vendor/LICENSE-three.txt`。不載入 glTF、外部圖片、字體或任何遠端資源。

## 已知限制

- 需要 WebGL2 與硬件加速。無 WebGL2 時頁面會顯示提示。
- SSAO 與 Bloom 是自寫即時近似；玻璃折射為 Three.js 即時 transmission，並非離線光線追蹤。8-bit fallback 的高光與 Bloom 較弱。
- 拖曳以物件原點限制在桌面範圍，不做碰撞或物理模擬；物件可重疊，大型擺設可伸出桌邊。
- 調整材質主要作用於物件主體，鍵帽、葉片、螢幕內容等保留本來細節。
- localStorage 按瀏覽器／開啟來源分開；部分瀏覽器限制 file:// 儲存。JSON 匯出／匯入是較可靠的備份及跨瀏覽器方式。頁面不自動儲存。
- 手機使用堆疊式設定面板，主要為桌面滑鼠操作設計；觸控支援單指拖曳，沒有雙指縮放。
- 第一次使用新電腦／其他 GPU 的效能與畫面仍應自行確認。

## 預覽與驗證

`preview.png` 為實際瀏覽器渲染的初始畫面（如環境成功產生）。建議截圖位置：預設視角完整桌面、選中玻璃杯時右側材質面板、旋轉與縮放後的自訂場景。

開發診斷：瀏覽器 console 執行 `deskDiagnostics()`，可讀取 Three.js 版本、WebGL2、MSAA、HDR 及場景資料。測試結果見 `verification.json`。

### 本次環境驗證結果

已通過 `node --check js/main.js` 與 `node tests/logic.cjs`。後者使用實際 Three.js 幾何與材質、模擬 DOM／renderer，涵蓋九種預設模型建立、新增、顏色／材質／旋轉／縮放、複製、移除、儲存讀取及無效 JSON 保留場景。這些測試不代表 GPU 或瀏覽器畫面驗證。

此環境啟動 Chromium 被 macOS `bootstrap_check_in ... Permission denied` 阻擋；替代瀏覽器工具亦無可用批准。未產生 `preview.png`，GLSL 編譯、實際拖曳與玻璃／後處理畫面尚待在可用瀏覽器確認。沒有為此修改 sandbox 或全域設定。
