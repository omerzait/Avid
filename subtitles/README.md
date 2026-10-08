# Avid subtitle tools / כתוביות לאוויד

שתי גרסאות, ממשק משותף. הגרסה המקורית נשארת ב־https://avid-wav-subcap.omerzait.chatgpt.site ללא שינוי.

## מסלולים

- `/` — חינם: Whisper Turbo מותאם לעברית של ivrit-ai, הצלבה מול מודל Whisper נוסף ובדיקה חוזרת של מחלוקות. העיבוד כולו ב־Web Worker במחשב המשתמש. אין מפתח API, חיוב, שרת תמלול או חשבון.
- `/cloud.html` — מסלול OpenAI הקיים. דורש מפתח אישי וחיוב API. אינו חינמי לתמלול. אין מפתח מוטמע בקוד.

שתי הגרסאות כוללות עורך כתוביות, היסטוריה מקומית, PNG שקופים, Avid DS TXT, MOV עם אלפא וחבילת ZIP. כל כתובית בשורה אחת, עד שבע מילים, לפחות עשרה פריימים. פיסוק ופאוזות קובעים גבולות, ומשפט ארוך מתחלק לחלקים מאוזנים.

## מה עדיין צריך לבדוק

גרסת הדפדפן אינה שוות איכות מובטחת ל־GPT-Transcribe ו־GPT-6.1 Sol. אין בה עורך שפה גדול. היא משתמשת בהצלבה מול האודיו ומסמנת ספקות במקום להמציא תיקונים. שדה ההקשר נשמר ומשמש לעיון ולסימון מונחים; בשלב הזה הוא אינו מוזן כמסגרת סמנטית למודל Whisper. בדיקת איכות על קובץ הכביסה המקורי ועל מחשב Windows עדיין נדרשת. בדיקות הקוד אינן בדיקת תמלול אמיתי.

המודל העברי הראשון דורש כ־1.6GB הורדה ועוד מודל להצלבה. המטמון של Transformers.js מצמצם הורדות חוזרות. מחשב חלש או מעט זיכרון עלולים לגרום לכשל. העיבוד מתבצע ב־WASM יציב. Service Worker מוסיף כותרות בידוד כדי לאפשר עד ארבעה חוטי עיבוד ב־GitHub Pages; אם הבידוד חסום, התוכנה חוזרת לחוט אחד. הדף עשוי להיטען פעם אחת מחדש לפני בחירת הקובץ. הורדת המודלים אינה נספרת באחסון GitHub — הם יורדים ישירות מ־Hugging Face. עד שלוש דקות אודיו. מהירות תלויה במחשב, ואין הבטחה לזמן אמת.

MOV משתמש ב־QuickTime Animation עם פריימים עצמאיים. הייבוא לאוויד דורש בדיקה; PNG ו־SubCap נשארים אפשרויות הייצוא האחרות. פרויקטים נשמרים ב־IndexedDB באותו מחשב/דפדפן. הם אינם עוברים אוטומטית בין דומיינים או מחשבים; השתמש בשמור/פתח פרויקט. מדיה ו־WAV נשמרים מקומית, ולא נמצאים במאגר הציבורי.

## עיצוב משותף

`shared/index.html` הוא תבנית הממשק היחידה. העיצוב נמצא בו וב־`shared/*.css`. כלי העריכה, הפרויקטים והייצוא משותפים. `scripts/build.mjs` מייצר שתי כניסות מאותה תבנית ומחליף רק את מסלול התמלול ואת ההסברים המתאימים. ערוך את `shared`, לא את `public`, והפעל build. האתר המקורי שנשאר כעת ללא שינוי יעודכן רק כשנחיל עליו במפורש את העיצוב העתידי.

## פריסה חינמית ב־GitHub Pages

1. הקוד מיועד לתיקיית `subtitles` במאגר הציבורי `omerzait/Avid`. קובץ הפריסה צריך להיות בשורש המאגר: `.github/workflows/subtitles-pages.yml`.
2. Settings → Pages → Build and deployment → Source: GitHub Actions.
3. דחיפה ל־`main` מריצה בדיקות, מייצרת את שני המסלולים ומפרסמת. כתובת האתר מוצגת ב־Actions / Deploy.

אין שירות שרת או מנוי אחסון. אל תעלה מפתחות API או קבצי לקוח. ניתן גם לפרסם את תיקיית `public` ישירות כאתר סטטי.

## עבודה מקומית

נדרש Node רק למפתח, לא למשתמשי האתר. אין התקנת חבילות לבנייה.

```sh
npm test
npm run build
python3 -m http.server 8080 --directory public
```

פתח http://localhost:8080. טעינה ישירה ב־file:// אינה נתמכת עבור Web Workers.

## מקורות ורישיונות

- Hebrew fine-tune: ivrit-ai, Apache 2.0; ONNX conversion: Kobi Rivlin, Apache 2.0. https://huggingface.co/krivlin/whisper-large-v3-turbo-ivrit-ai-timestamped-onnx
- Generic Whisper Turbo: OpenAI MIT, ONNX conversion: onnx-community. https://huggingface.co/onnx-community/whisper-large-v3-turbo_timestamped
- Transformers.js 3.8.1: Apache 2.0, loaded from a pinned CDN version.
- JSZip 3.10.1: MIT / GPLv3, see vendor notice and upstream license.
- Alef, Heebo, Rubik: SIL Open Font License, licenses bundled under fonts/.
- PNG editor interface inspiration: https://yuvartz.github.io/subtitle-maker/ ; credits in vendor/NOTICE.txt.
