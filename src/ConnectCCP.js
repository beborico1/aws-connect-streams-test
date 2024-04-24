// ConnectCCP.tsx
import { useConnectCCPHook } from "./hook"
import { memo } from "react"

const ConnectCCP = () => {
  const { ref } = useConnectCCPHook()

  return (
    <div ref={ref} className={"w-full h-full min-w-[400px] min-h-[480px]"}>
      test connect container
    </div>
  )
}

export default memo(ConnectCCP)
