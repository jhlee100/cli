//CALL TREE 만드는 절차
// cscope  ctags awk 설치    awk는 cmd로 출력을 특정 열을 선택해주는 명령어.....백문이 불여일견 인터넷 검색후 몇번 해보시면 금방 이해
// node v16.16.0 설치됨 ...높은 버전이어도 상관 없을 듯...
//
//
//수행
//find ./ -name *.[cC] > cscope.files   ==> cscope.files 출력됨 (분석할 확장자 c나 c로 끝나는 파일의 목록 만들어줌)
//cscope -i cscope.files (cscope.out 출력됨)   프로그램 실행 후 ctrl + d 를 눌러 빠져 나오면 cscope.out 만들어져 있음 (function call 관계 DB파일)
//56라인에 n.files 라고 해 놓은 것은 cscope.files를 편집하여 분석하고자 하는 파일만을 남기고 다른 것은 지움....(안그러면 소스 복잡해 지면 정신없고, 오래걸림) ...시간이 허락하면 그냥 전부 해도됨....
//즉 n.files 는 cscope.files 와 같게 해도 됨. -----> 최종 index.html이 출력되고......caller graph 완성....(html에 caller 관련 데이터 많으면 html 중간에  [대기] 팝업 뜰 수 있음.....컴퓨터 빠르면 금방 뜰 수도......)...나가기 말고 기다리심 언젠가는 나옵니다. ;;;;
const exec = require("child_process").exec;
const fs = require("fs");

const GAPX = 300;
const GAPY = 70;

let posX = 0;
let posY = 0;

let fileNumber = 0;
let funcNumber = 0;

let gmArr = [];

function isEmptyArr(arr) {
    if (Array.isArray(arr) && arr.length === 0) {
	return true;
    }
    return false;
}

function findFunctionIndex(obj, func) {
    const element = obj.findIndex((elm) => {
	return elm.func === func;
    });
    return element;
}

function shSync(cmd) {
    // import exec method from child_process module
    const { execSync } = require("child_process");
    execSync(cmd);
    // console.log(cmd);
}

function sh(cmd) {
    return new Promise(function (resolve, reject) {
	exec(cmd, (err, stdout, stderr) => {
	    if (err) {
		reject(err);
	    } else {
		resolve({ stdout, stderr });
	    }
	});
    });
}

// let { stdout } = await sh("cat a.x"); //DB가 되는 파일 리스트
// let { stdout } = await sh("cat one.files"); //DB가 되는 파일 리스트
//let { stdout } = await sh("cat all_f_list.x"); //DB가 되는 파일 리스트
async function readIndexFile() {
    //  let { stdout } = await sh("cat filter.files"); //DB가 되는 파일 리스트
    // let { stdout } = await sh("cat n.files"); //DB가 되는 파일 리스트

    //  let { stdout } = await sh("cat one.files"); //DB가 되는 파일 리스트

    let { stdout } = await sh("cat cscope.files"); //DB가 되는 파일 리스트
    
    const arr = stdout.split("\n");
    prevFilename = "";
    currFilename = "";
    retArr = [];

    for (let pathFilenameFunction of arr) {
	subArr = pathFilenameFunction.split(",");

	subIdx = 0;

	for (let val of subArr) {
	    param = String(val);
	    if (subIdx == 0 && param != "") {
		//find  ./ -name "*.[chsCHS]" -exec ctags -x --c-types=f {} \; | awk {'print $4'} | grep "\/*\w*[.]c"
		//subIdx : 0=path+fileName, 1=function
		//fName   : 0 ./bsw_code/iau_diagnostic_dtc.c
		fName = val.match(/\w*[.]c/g); //iau_diagnostic_dtc.c 즉, 파일 이름 찾아냄
		currFilename = fName;

		subIdx = 1;
		if (String(prevFilename) != String(currFilename)) {
		    //console.log("---------------------------------------"); //------------------------------
		    //console.log(String(currFilename));
		    //console.log("-> no   " + fileNumber + "  name : " + currFilename);
		    posY = 0;
		    posX = posX + GAPX;
		    //console.log("---------------------------------------"); //------------------------------
		    prevFilename = currFilename;
		    const functionList = await getFunctionList(param);
		    funSubArr = functionList.split("\n");

		    //빈배열.제거
		    notEmptyArr = funSubArr.filter((element) => element !== "");

		    //함수.중복.제거
		    const uniqueFunSubArr = notEmptyArr.filter((element, index) => {
			return notEmptyArr.indexOf(element) === index;
		    });
		    // const set = new Set(notEmptyArr);
		    // const uniqueFunSubArr = [...set]; //ccorean

		    for (let fun of uniqueFunSubArr) {
			//console.log("-> " + fileNumber + " " + currFilename + " " + val);
			retArr.push(
			    fileNumber + " " + currFilename + " " + funcNumber + " " + fun
			);
			funcNumber++;
			fileNumber = fileNumber + 1;
		    }
		    //console.log(funSubArr.length + " ______ " + uniqueFunSubArr.length); //중복.검사 (배열.길이로...)
		} else {
		    //console.log("dup-"); //같은 파일(한번만 처리)
		}
	    }
	}
    }
    return retArr;
}

async function catFile(fileName) {
    if (fileName == "") return;

    cmd = "cat " + fileName;
    let { stdout } = await sh(cmd);
    return stdout;
}

function getCscopeFiles() {
    cmd = "find ./ -name \"*.[cC]\" > cscope.files";
    shSync(cmd);
}

function getCscopeReference() {
    cmd = "cscope -b -i cscope.files";
    shSync(cmd);
}

//State_Init
//ctags -x --c-types=f ./app_code/IAU/a_app_function/iau_function.c
async function getFunctionList(fileName) {
    if (fileName == "") return;

    cmd = "ctags -x --c-types=f " + fileName + " | awk {'print $1'}";

    //console.log("cmd0: " + cmd);
    let { stdout } = await sh(cmd);
    return stdout;
}

//State_Init
async function getCallThisFunctionList(funcName) {
    if (funcName == "") return;

    cmd = "cscope -L3 " + funcName + " | awk {'print $1 \",\" $2'}";


    let { stdout } = await sh(cmd);

    retStr = String(stdout);

    // console.log("cmd: " + cmd + ", retStr: " + retStr);    
    return retStr;
}

async function getCallThisFuncUniqList(funcName) {
    let retStr1 = await getCallThisFunctionList(funcName);

    //console.log(retStr1);

    const arr = retStr1.split("\n");

    //빈배열.제거
    notEmptyArr = arr.filter((element) => element !== "");

    //함수.중복.제거
    // const set = new Set(notEmptyArr);
    // const uniqueFunSubArr = [...set];
    const uniqueFunSubArr = notEmptyArr.filter(
	(element, index) => notEmptyArr.indexOf(element) === index
    );

    //    console.log("uniqueFunSubArr: " + uniqueFunSubArr);    
    return uniqueFunSubArr;
    // console.log(uniqueFunSubArr);
    // console.log("length====" + uniqueFunSubArr.length);
    // console.log(isEmptyArr(uniqueFunSubArr));
}

/*-----------------------------------------------------------------------/
  1.  :파일리스트: + :함수:   ---> searchFunctionDB
  2.  연결관계                      ---> searchFromToDB
  출력하면 됨
  /-----------------------------------------------------------------------*/
function _printDBinfo() {
    console.table(searchFunctionDB); //All.(함수Index)+(함수Name)
//    console.log(searchFunctionDB.length + " " + "searchFunctionDB");
    console.table(searchFromToDB);
//    console.log(searchFromToDB.length + " " + "searchFromToDB");
}

/*-----------------------------------------------------------------------/

  /-----------------------------------------------------------------------*/
function _printFunction() {
    
    prevFilename = "";
    currFilename = "";

    _allPrint = "";

    _keyPrint = "";
    _elmPrint = "";

    indexY = 0;

    for (let val of searchFunctionDB) {
	currFilename = val.file;

	if (String(prevFilename) != String(currFilename)) {
	    prevFilename = currFilename;
	    //      console.log(currFilename);

	    _keyPrint =
		'{ "key": "' +
		val.fileIdx +
		'_", "isGroup": true, "text":"' +
		currFilename +
		"_" +
		val.fileIdx +
		'", "color":"green", "fill":"lightgreen"},';
	    _allPrint = _allPrint + _keyPrint + "\n";
	    //console.log(_keyPrint);

	    posY = 0;
	    posX = posX + GAPX;
	}

	comYLine = val.lFuncIdx % 25;
	//comYLine = 1; //ccorean temp

	if (val.lFuncIdx != 0 && comYLine == 0) {
	    posY = 0;
	    posX = posX + 260;
	    indexY++;
	}

	fillPink = "";
	fillPink = ', "fill": "pink"';

	/*    
	      _elmPrint =
	      '{"key":"' +
	      val.funcIdx +
	      '", "loc":"' +
	      posX +
	      " " +
	      posY +
	      '", "text":"' +
	      val.func +
	      '", "group":"' +
	      val.fileIdx +
	      '_"  },';
	*/

	_elmPrint =
	    '{"key":"' +
	    val.funcIdx +
	    '", "loc":"' +
	    posX +
	    " " +
	    posY +
	    '", "text":"' +
	    val.func +
	    '", "group":"' +
	    val.fileIdx +
	    '_"' +
	    fillPink +
	    "},";

	_allPrint = _allPrint + _elmPrint + "\n";
	//console.log(_elmPrint);
	posY = posY + GAPY;
    }

    const newStr = String(_allPrint).substring(0, _allPrint.length - 2);


    //console.log("newStr: " + newStr);
    //  console.log("printFunction() returns");
    
    return newStr;
}

/*-----------------------------------------------------------------------/

  /-----------------------------------------------------------------------*/
function _printLinkDataArray() {
    _allLink = "";
    _oneLink = "";

    for (let val of searchFromToDB) {
	_oneLink = '{"from":' + val.from + ' ,"to":' + val.to + ',"color":"red"},';
	_allLink = _allLink + _oneLink + "\n";
	//console.log(oneLink);
    }

    const newStr = String(_allLink).substring(0, _allLink.length - 2);
//    console.log("in printLinkDataArray(), newStr: " + newStr);
    return newStr;
}

/*-----------------------------------------------------------------------/

  /-----------------------------------------------------------------------*/
function _read2File(fileName) {
    fs.readFileSync(fileName);
}

function _write2File(fileName, text) {
    fs.writeFileSync(fileName, text, function (err) {
	if (err) {
	    return console.log(err);
	}
	console.log("The file was saved!");
    });
}

/*-----------------------------------------------------------------------/

  /-----------------------------------------------------------------------*/
async function my() {
    oneArr = [];
    searchFunctionDB = [];
    searchFromToDB = [];

    let tempArr = [];

    allFileAllFunc = await readIndexFile(); //(모든파일) + (모든Unique함수:중복함수제거)
    //  console.log(allFileAllFunc);
    //  console.log(ret);

    keyv = 0;
    pfileName = "";
    cfileName = "";
    fileNumber = 0;
    funcv = "";
    _changed = false;
    localFuncIdx = 0;

    //함수 찾기 위한 DB를 만듬
    for (let val of allFileAllFunc) {
	tempArr = val.split(" ");

	index = 0;
	//0=fileNumber, 1=fileName, 2=functionNumber, 3=functionName
	for (let vv of tempArr) {
	    if (index === 1) {
		fileName = vv; //1=fileName

		cfileName = fileName;
		//        console.log(pfileName + " | " + cfileName);

		if (String(pfileName) !== String(cfileName)) {
		    if (String(pfileName) != "") {
			fileNumber++;
		    }
		    pfileName = cfileName;
		    localFuncIdx = 0; //파일이 바뀌면, 현재 파일  index를 0으로 변경
		}
	    }
	    if (index === 2) {
		keyv = vv; //2=functionNumber
	    }
	    if (index === 3) {
		funcv = vv; //3=functionName
		searchFunctionDB.push({
		    fileIdx: fileNumber,
		    funcIdx: keyv,
		    lFuncIdx: localFuncIdx,
		    file: fileName,
		    func: funcv,
		});
		localFuncIdx++; //
	    }
	    index++;
	}
    }

    // console.log(searchFunctionDB);
    
    // console.log(
    //   findFunctionIndex(searchFunctionDB, "Set_EepromData_BLE_TRX_UUID")
    // );

    //0 SWC_Input.c 0 DHS_Timeout_DTC
    //0 SWC_Input.c 1 RE_BCAN_ADAS_PRK_20_20ms_1
    //0 1                  2 3
    //0=fileNumber, 1=fileName, 2=functionNumber, 3=functionName
    for (let val of allFileAllFunc) {
	gmArr = val.split(" ");
	idxvv = 0;
	fromFunction = -1;
	toFunction = -1;

	for (let currFunc of gmArr) {
	    // if (idxvv === 2) {
	    //   //2=functionNumber
	    //   fromFunction = currFunc;
	    // }

	    if (idxvv === 3) {
		//console.log("function========== " + fromFunction + "_" + vv); //3=functionName 함수.이름

		let retStr1 = await getCallThisFuncUniqList(currFunc); //함수 하나를 call하는 함수리스트 얻음
		if (!isEmptyArr(retStr1)) {
		    // console.log(retStr1);
		    oneFunc = String(retStr1);
		    oneSplit = oneFunc.split(","); //찾은 path , fileName
		    mEven = 0;

		    for (let vvv of oneSplit) {
			if (mEven % 2 == 1) {
			    fromFunction = findFunctionIndex(searchFunctionDB, vvv); //2) 부르는 함수
			    toFunction = findFunctionIndex(searchFunctionDB, currFunc); //1) 이 함수를

			    if (fromFunction != -1 && toFunction != -1) {
				searchFromToDB.push({
				    from: fromFunction,
				    to: toFunction,
				    ffunc: vvv,
				    tfunc: currFunc,
				});
			    }
			}
			mEven += 1;
		    }
		}
	    }
	    idxvv++;
	}
    }

//    console.log("-------- searchFromToDB -------- searchFromToDB.length=" + searchFromToDB.length);
    // console.log(searchFromToDB);
    
    // _printDBinfo();
    // _printFunction();
    // _printLinkDataArray();

    json_data = [];

    const nodes = _printFunction();
    const edges = _printLinkDataArray();

    json_data = json_data + "{ \"class\": \"Application\",\n  \"nodeDataArray\":\n  [";
    json_data = json_data + nodes;
    json_data = json_data + "], \n\"linkDataArray\":\n[";
    json_data = json_data + edges;
    json_data = json_data + "]\n}";

    _write2File(process.argv[2], json_data);
    console.log(process.argv[2] + " file(json format) saved.");
}

function check_argument() {
    if ( !(process.argv[2]) ) {
	console.error("Usage: node.js cs_vertical.js [output file]");
	process.exit(-1);
    }
}

check_argument();
getCscopeFiles();
getCscopeReference();
my();

