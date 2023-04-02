이 프로젝트는 C/C++ call graph를 node와 edge가 나타나있는 graph형태로 표현하기 위해 만들었습니다. 현재 goJS에서 제공하는 diagram을 사용합니다.

* 준비할 것
아래 툴의 실행 바이너리가 실행path에 있어야한다.
node.js  ; javascript interpreter
cscope   ; cross-reference 
ctag     ; function list

* 사용법

** 단계1
분석하고자하는 소스가 있는 아래 shell command를 실행한다
$ node.js cs_vertical.js [output file]

결과 : json format으로 된 output file이 command를 실행한 path에 생성된다
** 단계2
index.html를 브라우저에서 연다

** 단계3
단계1에서 생성된 output file을 브라우저에서 선택한다
결과 : diagram이 나타난다

주의! 소스파일의 갯수가 많은 경우 각 단계의 실행시간이 비정상적으로 늘어날 수 있으나,
대기하면 실행됩니다.
