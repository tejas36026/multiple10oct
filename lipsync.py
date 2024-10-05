import numpy as np
import cv2

def text_to_phonemes(speech_text):
    # This is a simplified phoneme mapping. In practice, you'd use a more sophisticated system.
    phoneme_map = {
        'A': 'AA', 'E': 'EH', 'I': 'IY', 'O': 'OW', 'U': 'UW',
        'B': 'B', 'C': 'K', 'D': 'D', 'F': 'F', 'G': 'G',
        'H': 'HH', 'J': 'JH', 'K': 'K', 'L': 'L', 'M': 'M',
        'N': 'N', 'P': 'P', 'Q': 'K', 'R': 'R', 'S': 'S',
        'T': 'T', 'V': 'V', 'W': 'W', 'X': 'K S', 'Y': 'Y', 'Z': 'Z'
    }
    return [phoneme_map.get(char.upper(), 'SP') for char in speech_text]

def phonemes_to_visemes(phonemes):
    # Simplified viseme mapping
    viseme_map = {
        'AA': 'OpenMouth', 'EH': 'SmallOpenMouth', 'IY': 'SmileMouth',
        'OW': 'RoundMouth', 'UW': 'PursedMouth',
        'B': 'ClosedMouth', 'P': 'ClosedMouth', 'M': 'ClosedMouth',
        'F': 'BiteBottom', 'V': 'BiteBottom',
        'TH': 'TongueOut', 'DH': 'TongueOut',
        'S': 'SmallOpenMouth', 'Z': 'SmallOpenMouth',
        'SH': 'RoundMouth', 'CH': 'RoundMouth', 'JH': 'RoundMouth',
        'SP': 'RestMouth'
    }
    return [viseme_map.get(phoneme, 'RestMouth') for phoneme in phonemes]

def get_base_mouth_shape(viseme):
    # Define base shapes for each viseme
    shapes = {
        'OpenMouth': np.array([(0, 0), (100, 0), (100, 80), (0, 80)]),
        'SmallOpenMouth': np.array([(0, 20), (100, 20), (100, 60), (0, 60)]),
        'SmileMouth': np.array([(0, 30), (100, 30), (100, 50), (0, 50)]),
        'RoundMouth': np.array([(20, 20), (80, 20), (80, 80), (20, 80)]),
        'PursedMouth': np.array([(40, 40), (60, 40), (60, 60), (40, 60)]),
        'ClosedMouth': np.array([(0, 40), (100, 40), (100, 41), (0, 41)]),
        'BiteBottom': np.array([(0, 30), (100, 30), (100, 50), (0, 50)]),
        'TongueOut': np.array([(0, 20), (100, 20), (100, 70), (0, 70)]),
        'RestMouth': np.array([(0, 35), (100, 35), (100, 45), (0, 45)])
    }
    return shapes[viseme]

def warp_image(image, base_shape, jaw_position):
    height, width = image.shape[:2]
    mouth_rect = cv2.boundingRect(base_shape)
    
    # Adjust jaw position
    base_shape[:, 1] += jaw_position
    
    # Define correspondences between base shape and target shape
    src_points = np.float32([[0, 0], [width, 0], [width, height], [0, height]])
    dst_points = np.float32(base_shape)
    
    # Compute the transformation matrix
    M = cv2.getPerspectiveTransform(src_points, dst_points)
    
    # Apply the transformation
    warped = cv2.warpPerspective(image, M, (width, height))
    
    return warped

def adjust_teeth_visibility(image, openness):
    # Simplified teeth visibility adjustment
    height, width = image.shape[:2]
    teeth_area = image[int(height*0.4):int(height*0.6), int(width*0.3):int(width*0.7)]
    
    # Adjust brightness of teeth area based on openness
    teeth_area = cv2.addWeighted(teeth_area, openness, np.zeros_like(teeth_area), 1-openness, 0)
    
    image[int(height*0.4):int(height*0.6), int(width*0.3):int(width*0.7)] = teeth_area
    return image

def interpolate_frames(key_frames):
    interpolated = []
    for i in range(len(key_frames) - 1):
        for t in np.linspace(0, 1, num=5):  # Create 5 intermediate frames
            inter_frame = cv2.addWeighted(key_frames[i], 1-t, key_frames[i+1], t, 0)
            interpolated.append(inter_frame)
    return interpolated

def animate_lips(speech_text, base_image):
    phonemes = text_to_phonemes(speech_text)
    visemes = phonemes_to_visemes(phonemes)
    
    frames = []
    for viseme in visemes:
        base_shape = get_base_mouth_shape(viseme)
        jaw_position = np.random.randint(-5, 6)  # Random jaw movement
        warped_image = warp_image(base_image, base_shape, jaw_position)
        openness = 1.0 if viseme in ['OpenMouth', 'SmallOpenMouth'] else 0.5
        adjusted_image = adjust_teeth_visibility(warped_image, openness)
        frames.append(adjusted_image)
    
    interpolated_frames = interpolate_frames(frames)
    return interpolated_frames

# Usage example
base_image = cv2.imread('lips.png')
speech_text = "Hello, how are you?"
animated_frames = animate_lips(speech_text, base_image)

# Display or save the animated frames
for i, frame in enumerate(animated_frames):
    cv2.imwrite(f'frame_{i:03d}.png', frame)