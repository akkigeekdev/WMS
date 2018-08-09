import { Component } from '@angular/core';
import { SwUpdate } from'@angular/service-worker';
import jsQR from "jsqr";
import { element } from '../../node_modules/@angular/core/src/render3/instructions';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {

  video:any; canvasElement:any; canvas:any;
  isScanSuccess:boolean = true;
  
  constructor(updates : SwUpdate){
    updates.available.subscribe(event =>{
      updates.activateUpdate().then(()=> document.location.reload())
    })
  }

  ngAfterViewInit(): void {

    this.video = document.createElement("video");
    this.canvasElement = <HTMLCanvasElement> document.getElementById("canvas");
    this.canvas = this.canvasElement.getContext("2d");


    // Use facingMode: environment to attemt to get the front camera on phones
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then( this.videoDeviceSuccess.bind(this), function(e){ });
  }

  videoDeviceSuccess(stream):void{
    this.video.src = window.URL.createObjectURL(stream);
    this.video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
    this.video.play();  
    requestAnimationFrame(this.showVideo.bind(this));
  }

  showVideo():void{

    try {
      if(this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
        this.canvasElement.height = this.video.videoHeight;
        this.canvasElement.width = this.video.videoWidth;
        this.canvas.drawImage(this.video, 0, 0, this.canvasElement.width, this.canvasElement.height);
        var imageData = this.canvas.getImageData(0, 0, this.canvasElement.width, this.canvasElement.height);
        var code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          this.drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#FF3B58");
          this.drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#FF3B58");
          this.drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF3B58");
          this.drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF3B58");
          // alert(code.data)0
        } else {
          
        }
      }
      
      requestAnimationFrame(this.showVideo.bind(this));
    } catch (error) {
      alert(error)
    }

  }

  drawLine(begin:any, end:any, color:any):void{
      this.canvas.beginPath();
      this.canvas.moveTo(begin.x, begin.y);
      this.canvas.lineTo(end.x, end.y);
      this.canvas.lineWidth = 4;
      this.canvas.strokeStyle = color;
      this.canvas.stroke();
  }

}
