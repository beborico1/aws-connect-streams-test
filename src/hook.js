// hook.ts
import { useRef, useEffect, MutableRefObject } from "react"

import "amazon-connect-streams"



const useConnectCCPHook = () => {
  const ref = useRef<HTMLDivElement | null>(null)

  const ccpUrl = `https://ss2cc.my.connect.aws/connect/ccp-v2`

  useEffect(() => {
    try {
      window.connect.core.initCCP(ref.current, {
        ccpUrl,
        region: "us-east-1",
        loginPopup: false,
        loginPopupAutoClose: true,
        loginOptions: { autoClose: true },
        softphone: { allowFramedSoftphone: true },
        pageOptions: {
          enableAudioDeviceSettings: true,
          enablePhoneTypeSettings: true,
        },
        ccpAckTimeout: 5000,
        ccpSynTimeout: 3000,
        ccpLoadTimeout: 10000,
      })
    } catch (err) {
      console.log("err --->", err)
    }

    return () => {
      // handle React 18 double mount of useEffect in dev mode
      window.connect.core.terminate()
      if (ref.current?.children) {
        const targetNode = ref.current.children.namedItem("Amazon Connect CCP")

        if (targetNode) {
          ref.current?.removeChild(targetNode)
        }
      }
    }
  }, [])

  return { ref }
}

export { useConnectCCPHook }
