import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "./feat/authSlice";
import "./css/LoginForm.css";

function LoginForm({ mode }) {
    const isSignup = (mode === "signup");
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [loginCheck, setLoginCheck] = useState(false);
    const [UsernameCheck, setUsernameCheck] = useState(false);
    const [pwCheck, setPwCheck] = useState(false);
    const [usernameTest, setUsernameTest] = useState(false);
    const [pwTest, setPwTest] = useState(false);

    const usernameForm = /^[a-zA-Z0-9-_]{5,20}$/;
    const pwForm = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/;
    const errorMessages = [
        { condition: loginCheck, message: "ID 또는 비밀번호가 틀렸습니다." },
        { condition: UsernameCheck, message: "이미 사용중인 ID입니다." },
        { condition: pwCheck, message: "비밀번호가 일치하지 않습니다." },
        { condition: usernameTest, message: "유효한 ID를 사용해주세요: 5~20자의 영문자, 숫자와 특수기호(_, -)" },
        { condition: pwTest, message: "유효한 비밀번호를 사용해주세요: 8~16자의 영문 대/소문자, 숫자, 특수문자" },
    ];

    useEffect(() => {
        /* 로그인 된 상태에서 접근하면 invalid */
        if (isLoggedIn) {
            navigate("/");
        }
        /* uri 변경 시 라벨 숨김 */
        setLoginCheck(false);
        setUsernameCheck(false);
        setPwCheck(false);
        setUsernameTest(false);
        setPwTest(false);
    }, [location.pathname, isLoggedIn, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isSignup) { // 회원가입
            if (!usernameForm.test(username)) {
                setUsernameCheck(false);
                setPwCheck(false);
                setUsernameTest(true);
                setPwTest(false);
                return;
            }
            if (!pwForm.test(password)) {
                setUsernameCheck(false);
                setPwCheck(false);
                setUsernameTest(false);
                setPwTest(true);
                return;
            }
            fetch("/api/sign-up", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name,
                    username: username,
                    password: password,
                    confirmPw: confirmPw,
                }),
            })
                .then((response) =>
                    response.json().then((data) => ({ status: response.status, data }))
                )
                .then(({ status, data }) => {
                    if (status === 201) { // 회원가입 성공
                        setUsernameCheck(false);
                        setPwCheck(false);
                        setUsernameTest(false);
                        setPwTest(false);
                        alert("회원가입이 완료되었습니다. 로그인 해주세요.");
                        navigate("/login");
                    } else if (status == 400) { // 비밀번호 불일치
                        setPwCheck(true);
                        setUsernameCheck(false);
                        setUsernameTest(false);
                        setPwTest(false);
                    } else if (status == 409) { // ID 중복
                        setUsernameCheck(true);
                        setPwCheck(false);
                        setUsernameTest(false);
                        setPwTest(false);
                    } else {
                        setPwCheck(false);
                        setUsernameCheck(false);
                        setUsernameTest(false);
                        setPwTest(false);
                        alert("회원가입 중 오류가 발생했습니다. 다시 시도해주세요.");
                    }
                })
        } else { // 로그인
            fetch("/api/log-in", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                }),
            })
                .then((response) =>
                    response.json().then((data) => ({ status: response.status, data }))
                )
                .then(({ status, data }) => {
                    if (status === 200) {
                        dispatch(setCredentials({
                            accessToken: data.accessToken,
                            username: data.username,
                        }));
                        navigate("/");
                    } else {
                        setLoginCheck(true);
                    }
                })
                .catch((error) => {
                    console.error("Error occurred on login:", error);
                    setLoginCheck(true);
                });
        }
    };

    return (
        <div className="login_body">
            <motion.div layout className="login">
                <motion.form
                    layout
                    className="login_form"
                    onSubmit={handleSubmit}
                >
                    <h1 className="login_title">
                        {isSignup ? "회원가입" : "로그인"}
                    </h1>
                    <div
                        className="login_inputs"
                        style={{ overflow: "hidden" }}
                    >
                        <AnimatePresence mode="wait">
                            {isSignup && (
                                <motion.div
                                    key="name"
                                    layout="position"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{
                                        duration: 0.3,
                                        ease: "easeInOut",
                                    }}
                                    className="login_box"
                                >
                                    <input
                                        type="text"
                                        placeholder="이름"
                                        className="login_input"
                                        required
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                    />
                                    <i className="ri-account-circle-line"></i>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.div layout className="login_box">
                            <input
                                type="text"
                                placeholder="ID"
                                className="login_input"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <i className="ri-user-fill"></i>
                        </motion.div>

                        <motion.div layout className="login_box">
                            <input
                                type="password"
                                placeholder="비밀번호"
                                className="login_input"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <i className="ri-lock-2-fill"></i>
                        </motion.div>

                        <AnimatePresence mode="wait">
                            {isSignup && (
                                <motion.div
                                    key="confirmPw"
                                    layout="position"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{
                                        duration: 0.3,
                                        ease: "easeInOut",
                                    }}
                                    className="login_box"
                                >
                                    <input
                                        type="password"
                                        placeholder="비밀번호 재입력"
                                        className="login_input"
                                        required
                                        value={confirmPw}
                                        onChange={(e) =>
                                            setConfirmPw(e.target.value)
                                        }
                                    />
                                    <i className="ri-lock-2-fill"></i>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <>
                        {errorMessages.map(
                        ({ condition, message }, idx) =>
                            condition && <label key={idx}>{message}</label>
                        )}
                    </>

                    <button type="submit" className="login_button">
                        {isSignup ? "회원가입" : "로그인"}
                    </button>

                    <div className="login_register">
                        {isSignup ? (
                            <>
                                이미 계정이 있으신가요?{" "}
                                <Link to="/login">로그인</Link>
                            </>
                        ) : (
                            <>
                                아직 회원이 아니신가요?{" "}
                                <Link to="/signup">회원가입</Link>
                            </>
                        )}
                    </div>
                </motion.form>
            </motion.div>
        </div>
    );
}

export default LoginForm;