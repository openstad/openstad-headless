import dynamic from "next/dynamic"

export default function Map (){
    const Map = dynamic(() => import("../components/maps/base-map"), {
        ssr: false
      })

    return (
        <Map style={{height: "400px"}}/>
    )
}