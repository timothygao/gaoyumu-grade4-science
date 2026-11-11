/* Keep the original air worksheet; share isolated review state and history. */
const reviewScript=document.createElement('script');
reviewScript.src='science-review.js?v=20261111-3';
reviewScript.onerror=()=>{document.getElementById('app').hidden=false;document.getElementById('app').textContent='练习组件加载失败，请刷新。原记录保留。';};
document.head.appendChild(reviewScript);
