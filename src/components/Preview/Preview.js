import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import QRCode from 'qrcode.react';

import background from './background.jpg';
import electrumLogo from './electrum_logo.png';

import wallet from '../../state/wallet';

import './Preview.css';

const qrsize = 200;

class Preview extends PureComponent {
    constructor(props) {
        super(props);

        this.redraw = true;
        this.draw = this.draw.bind(this);
    }

    componentDidMount() {
        this._context = this.canvas.getContext('2d');
        this._img = new Image();
        this._img.src = background;

        this._qrSeedImg = new Image();
        this._qrAddressImg = new Image();

        this._electrumLogo = new Image();
        this._electrumLogo.src = electrumLogo;

        this._qrSeedSvg = document.querySelector('#seed svg');
        this._qrAddressSvg = document.querySelector('#address svg');

        this._img.onload = () => this.draw(true);
        this._qrSeedImg.onload = () => this._context.drawImage(this._qrSeedImg, ((this.canvas.width / 3) / 2) - (qrsize / 4), this.canvas.height / 2 - qrsize / 2);
        this._qrAddressImg.onload = () => this._context.drawImage(this._qrAddressImg, this.canvas.width - (this.canvas.width / 3) + qrsize / 2, this.canvas.height / 2 - qrsize / 2)
    }

    drawSeed = () => {
        const offset = 30;
        const width = this.canvas.width - offset * 2;
        const height = 60;
        const posY = this.canvas.height - height - offset;

        this._context.fillStyle = 'rgba(255,255,255,0.7)';
        this._context.fillRect(offset, posY, width, height);

        let fontSize;
        if (this.props.seed.length < 80)
            fontSize = 40;
        else if (this.props.seed.length < 90)
            fontSize = 35;
        else if (this.props.seed.length < 100)
            fontSize = 30;
        else
            fontSize = 25;

        this._context.fillStyle = 'black';
        this._context.font = `${fontSize}px Tahoma, "Nimbus Sans"`;
        this._context.textAlign = 'center';
        this._context.textBaseline = 'middle';
        this._context.fillText(this.props.seed, offset + (width / 2), posY + height / 2);
    }

    drawElectrumLogo = () => {
        this._context.drawImage(this._electrumLogo, 30, 30);

        this._context.fillStyle = '#5588ff';
        this._context.font = '30px Tahoma, "Nimbus Sans"';
        this._context.textAlign = 'left';
        this._context.textBaseline = 'top';

        this._context.fillText('Use this seed with', 170, 35);
        this._context.fillText('Electrum Bitcoin Wallet', 170, 75);

        this._context.font = '24px Tahoma, "Nimbus Sans"';
        this._context.textBaseline = 'bottom';
        this._context.fillText('electrum.org', 170, 146);
    }

    drawAmount = () => {
        const offset = 30;
        const width = (this.canvas.width / 5);
        const height = 60;

        this._context.fillStyle = 'rgba(255,255,255,0.7)';
        this._context.fillRect(this.canvas.width / 2 - width / 2, offset, width, height);

        this._context.fillStyle = 'black';
        this._context.font = '40px Tahoma, "Nimbus Sans"';
        this._context.textAlign = 'center';
        this._context.textBaseline = 'top';
        this._context.strokeText(this.props.amount, this.canvas.width / 2, offset + 15);
    }

    drawAddress = () => {
        const offset = 30;
        const width = (this.canvas.width / 3);
        const height = 50;

        this._context.fillStyle = 'rgba(255,255,255,0.7)';
        this._context.fillRect(this.canvas.width - offset - width, offset, width, height);

        this._context.textAlign = 'center';

        this._context.fillStyle = 'black';
        this._context.font = '16px Tahoma, "Nimbus Sans"';
        this._context.textBaseline = 'top';
        this._context.fillText('Receiving Address:', (this.canvas.width - offset - width) + (width / 2), offset + 8);

        this._context.fillStyle = '#666';
        this._context.font = '16px Tahoma, "Nimbus Sans"';
        this._context.textBaseline = 'bottom';
        this._context.fillText(this.props.address, (this.canvas.width - offset - width) + (width / 2), offset + height - 8);
    }

    drawQRSeed = () => {
        const xml = new XMLSerializer().serializeToString(this._qrSeedSvg);
        this._qrSeedImg.src = `data:image/svg+xml;base64,${btoa(xml)}`;

        this._context.fillStyle = 'black';
        this._context.font = '16px Tahoma, "Nimbus Sans"';
        this._context.textBaseline = 'top';
        this._context.textAlign = 'center';
        this._context.fillText('Wallet Seed', ((this.canvas.width / 3) / 2) - (qrsize / 4) + qrsize / 2, this.canvas.height / 2 + qrsize / 2 + 10);
    }

    drawQRAddress = () => {
        const xml = new XMLSerializer().serializeToString(this._qrAddressSvg);
        this._qrAddressImg.src = `data:image/svg+xml;base64,${btoa(xml)}`;

        this._context.fillStyle = 'black';
        this._context.font = '16px Tahoma, "Nimbus Sans"';
        this._context.textBaseline = 'top';
        this._context.textAlign = 'center';
        this._context.fillText('Receiving Address', this.canvas.width - (this.canvas.width / 3) + qrsize, this.canvas.height / 2 + qrsize / 2 + 10);
    }

    draw(init) {
        if (!init)
            this._context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this._context.drawImage(this._img, 0, 0, this.canvas.width, this.canvas.width * (this._img.height / this._img.width))

        this.drawElectrumLogo();
        this.drawAddress();
        this.drawAmount();
        this.drawSeed();
        this.drawQRAddress();
        this.drawQRSeed();

        this.redraw = false;
    }

    componentWillReceiveProps(nextProps) {
        this.redraw = (this.props.seed !== nextProps.seed || this.props.amount !== nextProps.amount || this.props.address !== nextProps.address);
    }

    componentDidUpdate() {
        if (this.redraw)
            this.draw();
    }

    render() {
        return (
            <div className="wallet">
                <canvas id="canvas" ref={canvas => this.canvas = canvas} width="1544" height="657" />
                <div className="qrcode" id="seed"><QRCode value={this.props.seed} renderAs="svg" level="M" size={qrsize} /></div>
                <div className="qrcode" id="address"><QRCode value={this.props.address} renderAs="svg" level="M" size={qrsize} /></div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    seed: wallet.selectors.getSeed(state),
    amount: wallet.selectors.getAmount(state),
    address: wallet.selectors.getAddress(state),
});

export default connect(mapStateToProps)(Preview);
