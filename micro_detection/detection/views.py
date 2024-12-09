from rest_framework.response import Response
from rest_framework.decorators import api_view
from PIL import Image
import torch
import numpy as np
import cv2
from ultralytics import YOLO
import base64
from io import BytesIO


model = YOLO("/Users/rathore/Desktop/untitled folder/best.pt")

def image_to_base64(image_np):
    image_pil = Image.fromarray(cv2.cvtColor(image_np, cv2.COLOR_BGR2RGB))
    buffered = BytesIO()
    image_pil.save(buffered, format="JPEG")
    return base64.b64encode(buffered.getvalue()).decode('utf-8')

@api_view(['POST'])
def detect_microorganisms(request):
    image_file = request.FILES['image']
    image = Image.open(image_file)

    image_np = np.array(image)

    results = model.predict(image_np)

    all_microorganisms = set()

    for result in results:
        for box in result.boxes:
            class_id = int(box.cls.item())  
            confidence = box.conf.item()  
            microorganism_name = model.names[class_id]  
            all_microorganisms.add((microorganism_name, confidence))

            
            x1, y1, x2, y2 = map(int, box.xyxy[0])  
            cv2.rectangle(image_np, (x1, y1), (x2, y2), (255, 0, 0), 2)
            cv2.putText(image_np, f"{microorganism_name} {confidence:.2f}",
                        (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)

    image_with_boxes_base64 = image_to_base64(image_np)

    response_data = {
        "microorganisms": [{"name": name, "confidence": conf} for name, conf in all_microorganisms],
        "annotated_image": image_with_boxes_base64
    }

    return Response(response_data)
