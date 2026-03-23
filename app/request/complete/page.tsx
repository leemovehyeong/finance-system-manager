import { APP_NAME } from '@/lib/constants';

export default function RequestCompletePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-8">
      <div className="text-center">
        <div className="w-20 h-20 bg-[#34C759] rounded-full mx-auto mb-6 flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold text-ios-text tracking-tight mb-2">
          접수 완료
        </h1>

        <p className="text-base text-ios-subtext leading-relaxed mb-8">
          서비스 요청이 정상적으로 접수되었습니다.<br />
          담당자가 확인 후 연락드리겠습니다.
        </p>

        <p className="text-sm text-ios-subtext">
          {APP_NAME}
        </p>
      </div>
    </div>
  );
}
