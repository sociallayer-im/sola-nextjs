import Link from "next/link";
import styles from './footer.module.scss'

function Footer() {
    return (<div className={styles['footer']}>
        <div className={styles['left']}>
            <svg xmlns="http://www.w3.org/2000/svg" width="39" height="27" viewBox="0 0 39 27" fill="none">
                <path
                    d="M2.31952 25.6621C1.6759 25.6621 1.14929 25.1355 1.14929 24.4918V5.76813C1.14929 5.1245 1.6759 4.5979 2.31952 4.5979H32.7455C33.3892 4.5979 33.9158 5.1245 33.9158 5.76813V24.4918C33.9158 25.1355 33.3892 25.6621 32.7455 25.6621H2.31952Z"
                    fill="white" fillOpacity="0.8"/>
                <path
                    d="M32.7664 5.8512V24.5749H2.34034V5.8512H32.7664ZM32.7664 3.51074H2.34034C1.05309 3.51074 -0.00012207 4.56395 -0.00012207 5.8512V24.5749C-0.00012207 25.8622 1.05309 26.9154 2.34034 26.9154H32.7664C34.0536 26.9154 35.1068 25.8622 35.1068 24.5749V5.8512C35.1068 4.55225 34.0653 3.51074 32.7664 3.51074Z"
                    fill="#272928"/>
                <path
                    d="M5.85114 22.2346C5.20751 22.2346 4.68091 21.708 4.68091 21.0643V2.34064C4.68091 1.69701 5.20751 1.17041 5.85114 1.17041H36.2772C36.9208 1.17041 37.4474 1.69701 37.4474 2.34064V21.0643C37.4474 21.708 36.9208 22.2346 36.2772 22.2346H5.85114Z"
                    fill="#7FF7CE"/>
                <path
                    d="M36.2771 2.34046V21.0642H5.85108V2.34046H36.2771ZM36.2771 0H5.85108C4.56383 0 3.51062 1.05321 3.51062 2.34046V21.0642C3.51062 22.3514 4.56383 23.4046 5.85108 23.4046H36.2771C37.5644 23.4046 38.6176 22.3514 38.6176 21.0642V2.34046C38.6176 1.04151 37.5761 0 36.2771 0Z"
                    fill="#272928"/>
                <path
                    d="M16.3831 15.2131H12.8724C11.9011 15.2131 11.1171 14.429 11.1171 13.4577C11.1171 12.4864 11.9011 11.7024 12.8724 11.7024H16.3831C17.3544 11.7024 18.1385 12.4864 18.1385 13.4577C18.1385 14.429 17.3544 15.2131 16.3831 15.2131Z"
                    fill="#6CD7B2"/>
                <path
                    d="M33.9366 15.2131H30.4259C29.4546 15.2131 28.6705 14.429 28.6705 13.4577C28.6705 12.4864 29.4546 11.7024 30.4259 11.7024H33.9366C34.9079 11.7024 35.6919 12.4864 35.6919 13.4577C35.6919 14.429 34.9079 15.2131 33.9366 15.2131Z"
                    fill="#6CD7B2"/>
                <path
                    d="M16.3831 14.0429C16.0554 14.0429 15.798 13.7854 15.798 13.4578V7.6066C15.798 7.27894 16.0554 7.02148 16.3831 7.02148C16.7108 7.02148 16.9682 7.27894 16.9682 7.6066V13.4578C16.9682 13.7737 16.7108 14.0429 16.3831 14.0429Z"
                    fill="#FF7BAC"/>
                <path
                    d="M16.3832 5.85132C15.4119 5.85132 14.6278 6.63537 14.6278 7.60667V13.4578C14.6278 14.4291 15.4119 15.2132 16.3832 15.2132C17.3544 15.2132 18.1385 14.4291 18.1385 13.4578V7.60667C18.1385 6.63537 17.3544 5.85132 16.3832 5.85132Z"
                    fill="#272928"/>
                <path
                    d="M30.4259 14.0429C30.0983 14.0429 29.8408 13.7854 29.8408 13.4578V7.6066C29.8408 7.27894 30.0983 7.02148 30.4259 7.02148C30.7536 7.02148 31.0111 7.27894 31.0111 7.6066V13.4578C31.0111 13.7737 30.7536 14.0429 30.4259 14.0429Z"
                    fill="#FF7BAC"/>
                <path
                    d="M30.4259 5.85132C29.4546 5.85132 28.6705 6.63537 28.6705 7.60667V13.4578C28.6705 14.4291 29.4546 15.2132 30.4259 15.2132C31.3972 15.2132 32.1812 14.4291 32.1812 13.4578V7.60667C32.1812 6.63537 31.3972 5.85132 30.4259 5.85132Z"
                    fill="#272928"/>
            </svg>

            <Link href={'/'}>About us</Link>
            <Link href={'/'}>Contact us</Link>
        </div>

        <div className={styles['right']}>
            <div className={styles['text']}>We value your feedback!</div>
            <div>
                <Link href={'https://twitter.com/SocialLayer_im'} target='_blank'>
                    <svg className="icon" viewBox="0 0 1024 1024" version="1.1"
                         xmlns="http://www.w3.org/2000/svg" p-id="6542" width="18" height="18">
                        <path
                            d="M778.4 96h141.2L611.2 448.4 974 928H690L467.4 637.2 213 928H71.6l329.8-377L53.6 96h291.2l201 265.8L778.4 96z m-49.6 747.6h78.2L302.2 176h-84l510.6 667.6z"
                            p-id="6543"></path>
                    </svg>
                </Link>
                <Link href={'https://warpcast.com/sociallayer'} target='_blank'>
                    <svg className="icon" viewBox="0 0 1024 1024" version="1.1"
                         xmlns="http://www.w3.org/2000/svg" p-id="7605" width="18" height="18">
                        <path
                            d="M778.24 10.24H245.76A245.76 245.76 0 0 0 0 256v512a245.76 245.76 0 0 0 245.76 245.76h532.48A245.76 245.76 0 0 0 1024 768V256A245.76 245.76 0 0 0 778.24 10.24m34.816 732.416v21.504a20.906667 20.906667 0 0 1 23.168 20.48v24.234667h-219.434667v-24.277334c-0.085333-12.288 10.965333-21.546667 23.210667-20.437333v-21.504c0-9.386667 6.485333-17.152 15.274667-19.541333l-0.426667-186.197334c-6.741333-74.112-69.973333-132.181333-146.901333-132.181333-76.970667 0-140.16 58.069333-146.901334 132.181333l-0.426666 185.941334c9.728 1.792 22.698667 8.874667 23.04 19.797333v21.504a20.906667 20.906667 0 0 1 23.168 20.48v24.234667H187.349333v-24.277334a20.906667 20.906667 0 0 1 23.210667-20.437333v-21.504c0-10.794667 8.576-19.370667 19.370667-20.138667V385.664h-20.906667l-26.026667-86.656H295.68V215.125333h424.533333v83.882667h120.405334l-26.026667 86.613333h-20.906667v336.896c10.752 0.725333 19.328 9.386667 19.328 20.138667"
                            p-id="7606"></path>
                    </svg>
                </Link>
                <Link href={'https://t.me/sociallayer_im'} target='_blank'>
                    <svg className="icon" viewBox="0 0 1024 1024" version="1.1"
                         xmlns="http://www.w3.org/2000/svg" p-id="8661" width="18" height="18">
                        <path
                            d="M679.428571 746.857143l84-396q5.142857-25.142857-6-36t-29.428571-4L234.285714 501.142857q-16.571429 6.285714-22.571428 14.285714t-1.428572 15.142858 18.285715 11.142857l126.285714 39.428571 293.142857-184.571428q12-8 18.285714-3.428572 4 2.857143-2.285714 8.571429l-237.142857 214.285714-9.142857 130.285714q13.142857 0 25.714285-12.571428l61.714286-59.428572 128 94.285715q36.571429 20.571429 46.285714-21.714286z m344.571429-234.857143q0 104-40.571429 198.857143t-109.142857 163.428571-163.428571 109.142857-198.857143 40.571429-198.857143-40.571429-163.428571-109.142857-109.142857-163.428571T0 512t40.571429-198.857143 109.142857-163.428571T313.142857 40.571429 512 0t198.857143 40.571429 163.428571 109.142857 109.142857 163.428571 40.571429 198.857143z"
                            p-id="8662"></path>
                    </svg>
                </Link>
            </div>
        </div>


    </div>)
}

export default Footer
