이 프로젝트는 C/C++ call graph를 node와 edge가 나타나있는 graph형태로 표현하기 위해 만들었습니다. 현재 goJS에서 제공하는 diagram을 사용합니다.

* 준비할 것
shell command를 실행하기위해, 아래 툴의 실행 바이너리가 exec path에 있어야 한다.
node.js  ; javascript interpreter
cscope   ; cross-reference 
Exuberant ctag     ; function list,  다른 종류의 ctag(예를 들어 emacs ctags)는 옵션이 조금 달라서 안됨


* 사용법

** 단계1
분석하고자하는 소스가 있는 폴더에서 아래의 shell command를 실행한다
$ node cs_vertical.js [output file]

결과 : json format으로 된 output file이 shell command를 실행한 path에 생성된다

** 단계2
index.html를 브라우저에서 연다

** 단계3
단계1에서 생성된 output file을 브라우저에서 선택한다
결과 : diagram이 나타난다

주의! 소스파일의 갯수가 많은 경우 각 단계의 실행시간이 비정상적으로 늘어날 수 있으나,
대기하면 실행됩니다.
