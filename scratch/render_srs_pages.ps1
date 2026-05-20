$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Foundation.IAsyncOperation`1, Windows.Foundation, ContentType = WindowsRuntime]
$null = [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
$null = [Windows.Data.Pdf.PdfDocument, Windows.Data.Pdf, ContentType = WindowsRuntime]
$null = [Windows.Storage.Streams.InMemoryRandomAccessStream, Windows.Storage.Streams, ContentType = WindowsRuntime]

function Await-Operation($operation, [type]$resultType) {
  $method = [System.WindowsRuntimeSystemExtensions].GetMethods() |
    Where-Object {
      $_.Name -eq 'AsTask' -and
      $_.IsGenericMethodDefinition -and
      $_.GetGenericArguments().Count -eq 1 -and
      $_.GetParameters().Count -eq 1 -and
      $_.ToString().Contains('IAsyncOperation')
    } |
    Select-Object -First 1

  $task = $method.MakeGenericMethod($resultType).Invoke($null, @($operation))
  $task.Wait()
  return $task.Result
}

function Await-Action($operation) {
  $method = [System.WindowsRuntimeSystemExtensions].GetMethods() |
    Where-Object {
      $_.Name -eq 'AsTask' -and
      -not $_.IsGenericMethodDefinition -and
      $_.GetParameters().Count -eq 1
    } |
    Select-Object -First 1

  $task = $method.Invoke($null, @($operation))
  $task.Wait()
}

$outDir = 'C:\Users\mario\SWE_Assignment1\scratch\srs_native_pages'
New-Item -ItemType Directory -Force $outDir | Out-Null

$file = Await-Operation ([Windows.Storage.StorageFile]::GetFileFromPathAsync('C:\Users\mario\SWE_Assignment1\BudgetingSW-SRS-v1.pdf')) ([Windows.Storage.StorageFile])
$pdf = Await-Operation ([Windows.Data.Pdf.PdfDocument]::LoadFromFileAsync($file)) ([Windows.Data.Pdf.PdfDocument])
Write-Output "PageCount=$($pdf.PageCount)"

for ($i = 13; $i -le 42; $i++) {
  if ($i -gt $pdf.PageCount) { break }

  $page = $pdf.GetPage($i - 1)
  $stream = New-Object Windows.Storage.Streams.InMemoryRandomAccessStream
  $options = New-Object Windows.Data.Pdf.PdfPageRenderOptions
  $options.DestinationWidth = 1600
  Await-Action ($page.RenderToStreamAsync($stream, $options))
  $stream.Seek(0) | Out-Null

  $path = Join-Path $outDir "slide_$i.png"
  $fileStream = [System.IO.File]::Open($path, [System.IO.FileMode]::Create)
  $inputStream = [System.IO.WindowsRuntimeStreamExtensions]::AsStreamForRead($stream)
  $inputStream.CopyTo($fileStream)
  $fileStream.Close()
  $inputStream.Close()
  $stream.Dispose()
  $page.Dispose()
  Write-Output $path
}
