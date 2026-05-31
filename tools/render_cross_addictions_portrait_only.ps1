# Re-render portrait loop-v5 only (after bg + audio exist).
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

$Slug = "cross-addictions-same-loop-new-name"
$Bg = "public/videos/${Slug}-bg-alternating.mp4"
$Audio = "C:\Users\amoss\Downloads\Same Loop, New Name.wav"
$Srt = "public/videos/${Slug}-exact-v1.srt"
$PortraitOut = "public/videos/${Slug}-portrait-loop-v5.mp4"

$portraitFc = @"
[0:v]scale=1080:960:force_original_aspect_ratio=decrease,pad=1080:960:(ow-iw)/2:(oh-ih)/2:color=#f7f3ea[top];
color=#f7f3ea:s=1080x1920[bg];
[bg][top]overlay=0:0[base];
[base]subtitles='$Srt':original_size=1080x1920:force_style='FontName=Arial,FontSize=17,Alignment=2,MarginL=56,MarginR=56,MarginV=48,PrimaryColour=&H00FFFFFF,OutlineColour=&H002777A8,BackColour=&H80000000,BorderStyle=1,Outline=1,Shadow=0,WrapStyle=0'[v]
"@

ffmpeg -y -i $Bg -i $Audio -filter_complex $portraitFc -map "[v]" -map 1:a -c:v libx264 -preset veryfast -pix_fmt yuv420p -r 30 -c:a aac -b:a 192k -ar 48000 -movflags +faststart -shortest $PortraitOut
ffmpeg -y -ss 46 -i $PortraitOut -frames:v 1 -update 1 "public/videos/cross-addictions-portrait-loop-v5-preview.png"
Write-Host "Done: $PortraitOut"
