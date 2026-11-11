/* Air uses the same isolated review engine as the main science papers. */
const reviewScript = document.createElement('script');
reviewScript.src = 'science-review.js?v=20261111-2';
reviewScript.onerror = () => { document.getElementById('app').textContent = '练习组件加载失败，请刷新。原有学习记录保留。'; };
document.head.appendChild(reviewScript);
