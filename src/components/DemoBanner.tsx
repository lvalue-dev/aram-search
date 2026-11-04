import { isMockMode } from "@/lib/riot-api";
import Notice from "./ui/Notice";

/** 데모 데이터 모드일 때 실제 전적으로 오해하지 않도록 항상 띄운다 */
export default function DemoBanner() {
  if (!isMockMode()) return null;
  return (
    <Notice tone="demo" title="데모 데이터입니다 — 실제 전적이 아닙니다">
      서버에 <code className="font-mono">MOCK_RIOT_API=1</code> 이 켜져 있어 Riot API 대신 가짜 계정·전적을 만들어 보여주고 있습니다. 실제 전적을 보려면 서버 환경변수에서 이 값을 지우고 <code className="font-mono">RIOT_API_KEY</code> 를 넣은 뒤 재시작하세요.
    </Notice>
  );
}
