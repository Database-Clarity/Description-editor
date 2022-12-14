import styles from './Sockets.module.scss'

export function Sockets() {
   return (
      <div className={styles.item_sockets}>
         <img
            className={styles.frame_img}
            src="https://www.bungie.net/common/destiny2_content/icons/2a53b9dc2c9c90d3d8ee224d06368412.png"
         />
         <div className={styles.frame_info}>
            <div>Shadow Frame</div>
            <div>420 rpm / 69 impact</div>
         </div>
         <div className={styles.sockets}>
            <div>
               <img src="https://www.bungie.net/common/destiny2_content/icons/aeacc06cbe147ec400a10225a4dcd504.png" />
            </div>
            <div>
               <img src="https://www.bungie.net/common/destiny2_content/icons/54fa140e3e70ea7e5bd29b623ef75518.png" />
            </div>
            <div className={styles.masterwork_img}>
               <img src="https://www.bungie.net/common/destiny2_content/icons/8ebd558417d6c02e3ed2ffadc4bdbc48.jpg" />
               <img src="https://www.bungie.net/common/destiny2_content/icons/5c935649e5d3e72c967d6b20c3e44e85.png" />
            </div>
         </div>
      </div>
   )
}
