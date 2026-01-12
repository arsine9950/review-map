import { useState } from 'react';
import { auth, db } from '../firebase';
import { signInAnonymously } from 'firebase/auth';
import { setDoc, doc, collection, query, where, getDocs } from 'firebase/firestore';
import './MainUI.css';

interface NicknameModalProps {
  onLoginSuccess: (profile: { nickname: string; tag: string }) => void;
}

const NicknameModal = ({ onLoginSuccess }: NicknameModalProps) => {
  const [inputName, setInputName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 0000 ~ 9999 랜덤 태그 생성
  const generateTag = () => {
    const randomNum = Math.floor(Math.random() * 10000);
    return randomNum.toString().padStart(4, '0');
  };

  const handleStart = async () => {
    if (!inputName.trim()) {
      setError("닉네임을 입력해주세요!");
      return;
    }
    if (inputName.length > 8) {
        setError("닉네임은 8글자 이하로 해주세요.");
        return;
    }

    setLoading(true);
    setError('');

    try {
      let tag = generateTag();
      let isDuplicate = true;
      let retryCount = 0;

      // ★ 핵심: 중복이 없을 때까지(isDuplicate가 false가 될 때까지) 반복
      while (isDuplicate) {
        if (retryCount > 5) {
          setError("사용자가 너무 많아서 태그를 생성할 수 없어요 😭 다른 닉네임을 써주세요.");
          setLoading(false);
          return;
        }

        // DB에서 [닉네임 + 태그] 조합이 있는지 검사
        const usersRef = collection(db, "users");
        const q = query(
          usersRef, 
          where("nickname", "==", inputName),
          where("tag", "==", tag)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          // 중복 없음! 통과!
          isDuplicate = false;
        } else {
          // 중복 있음! 태그 다시 뽑고 재도전
          console.log(`중복 발생! (${tag}) 다시 뽑습니다...`);
          tag = generateTag();
          retryCount++;
        }
      }

      // --- 여기까지 오면 중복 없는 클린한 태그 확보 완료 ---

      // 파이어베이스 익명 로그인
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;

      const userProfile = {
        uid: user.uid,
        nickname: inputName,
        tag: tag,
        level: 1,
        exp: 0,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, "users", user.uid), userProfile);
      
      onLoginSuccess({ nickname: inputName, tag: tag });

    } catch (err) {
      console.error(err);
      setError("오류가 발생했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ui-overlay" style={{ background: 'white', zIndex: 9999, pointerEvents: 'auto', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', width: '100%', maxWidth: '400px', padding: '0 20px' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>방문한 곳을 리뷰로 남겨요 🚩</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>사용할 닉네임을 정해주세요!</p>
        
        <input 
          type="text" 
          placeholder="사용할 닉네임 입력"
          value={inputName}
          onChange={(e) => setInputName(e.target.value)}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '16px',
            border: '2px solid #eee',
            fontSize: '16px',
            marginBottom: '10px',
            outline: 'none',
            textAlign: 'center'
          }}
        />
        
        {error && <p style={{ color: '#ff4b4b', fontSize: '14px', marginBottom: '10px' }}>{error}</p>}

        <button 
          onClick={handleStart}
          disabled={loading}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '16px',
            border: 'none',
            background: '#3182F6',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? '확인 중...' : '시작하기'}
        </button>
      </div>
    </div>
  );
};

export default NicknameModal;